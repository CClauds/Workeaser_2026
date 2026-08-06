import { AuthContract } from '@ioc:Adonis/Addons/Auth';
import Mail from '@ioc:Adonis/Addons/Mail';
import Application from '@ioc:Adonis/Core/Application';
import Env from '@ioc:Adonis/Core/Env';
import Event from '@ioc:Adonis/Core/Event';
import Logger from '@ioc:Adonis/Core/Logger';
import Database from '@ioc:Adonis/Lucid/Database';
import Address from 'App/Models/Address';
import ClientAccount from 'App/Models/ClientAccount';
import CoworkAccount from 'App/Models/CoworkAccount';
import CoworkClient from 'App/Models/CoworkClient';
import CoworkUser from 'App/Models/CoworkUser';
import Team from 'App/Models/Team';
import User from 'App/Models/User';
import UserEmailActivation from 'App/Models/UserEmailActivation';
import UserLostPassword from 'App/Models/UserLostPassword';
import StripeConnectService from 'App/Services/Cowork/StripeConnectService';
import NotificationsService from 'App/Services/NotificationsService';
import AppError from 'App/Utils/AppError';
import ApplicationUrls from 'App/Utils/ApplicationUrls';
import { safeRandomName } from 'App/Utils/SafeFilename';
import { CoworkUserRoleEnum, NotificationTypeEnum, UserRoleEnum } from 'Contracts/enums';
import Crypto from 'crypto';
import Pick from 'lodash/pick';
import xlsx from 'node-xlsx';

export default class UserService {
  static async admin(auth: AuthContract, data: any = {}) {
    try {
      const token = await auth.use('api').attempt(data.email, data.password, {
        expiresIn: data.remember_me ? '10days' : '1days'
      });

      if (token.user.role !== UserRoleEnum.ADMIN) {
        throw new AppError(AppError.UNAUTHORIZED, 'Email or password is incorrect');
      }

      const response = {
        ...token.toJSON(),
        user: token.user.toJSON()
      };

      Event.emit('user:login', { email: data.email });
      return response;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(AppError.UNAUTHORIZED, 'Email or password is incorrect');
    }
  }

  static async login(auth: AuthContract, data: any = {}) {
    try {
      const token = await auth.use('api').attempt(data.email, data.password, {
        expiresIn: data.remember_me ? '10days' : '1days'
      });

      if (!token.user.emailConfirmed) {
        throw new AppError(AppError.UNAUTHORIZED, 'Email address has not been confirmed yet.');
      }

      const response = {
        ...token.toJSON(),
        user: token.user.toJSON()
      };

      Event.emit('user:login', { email: data.email });
      return response;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(AppError.UNAUTHORIZED, 'Email or password is incorrect');
    }
  }

  static async logout(auth: AuthContract) {
    await auth.use('api').revoke();
  }

  static async confirmEmailToken(data: any = {}) {
    const activation = await UserEmailActivation.findByOrFail('token', data.token);
    const user = await User.findOrFail(activation.userId);

    user.emailConfirmed = true;
    await user.save();
    await activation.delete();

    Event.emit('user:email_confirmed', { id: user.id });
  }

  static async resendEmailConfirmation(data: any = {}) {
    const user = await User.findBy('email', data.email);

    if (user) {
      if (user.emailConfirmed) {
        throw new AppError(AppError.VALIDATION_FAIL, 'Email already confirmed');
      }

      await this.sendConfirmationEmail(user.id);
    } else {
      throw new AppError(AppError.NOT_FOUND, 'No account found with this email');
    }
  }

  static async lostPassword(data: any = {}) {
    await this.sendLostPasswordEmail(data.email);
  }

  static async lostPasswordConfirmation(data: any = {}) {
    const search = await UserLostPassword.findByOrFail('token', data.token);
    const user = await User.findOrFail(search.userId);

    user.password = data.password;
    await user.save();
    await search.delete();

    Event.emit('user:password_changed', { id: user.id });
  }

  static async store(data: any = {}): Promise<User> {
    let user: User;
    let coworkAccountId: number | undefined;
    const trx = await Database.transaction();

    try {
      // HF-SPRINT-M-04: race condition em signup concorrente.
      // Validator faz `rules.unique('users', 'email')` mas SEM lock — duas requests
      // simultâneas com mesmo email passam ambas, falham no save com 500 (DB unique
      // constraint), user vê erro confuso e fica sem conta confirmada.
      // Fix: re-check dentro da transaction. Se já existir, erro claro de duplicate.
      if (data.email) {
        const existing = await User.query()
          .useTransaction(trx)
          .where('email', String(data.email).toLowerCase())
          .first();
        if (existing) {
          await trx.rollback();
          throw new AppError(AppError.VALIDATION_FAIL, 'Email already registered');
        }
      }

      user = new User();
      user.merge(Pick(data, [...User.fillable, 'role']));

      await user.useTransaction(trx).save();

      if (data.personal_address) {
        const newPersonalAddress = await new Address()
          .merge(data.personal_address)
          .useTransaction(trx)
          .save();

        await user.useTransaction(trx).related('personalAddress').associate(newPersonalAddress);
      }

      switch (data.role) {
        case UserRoleEnum.COWORKING:
          if (!data.cowork) {
            throw new AppError(AppError.VALIDATION_FAIL, 'Invalid Request');
          }

          const coworkAccount = await CoworkAccount.create(data.cowork, {
            client: trx
          });

          coworkAccountId = coworkAccount.id;

          await user.useTransaction(trx).related('coworkUser').create({
            userId: user.id,
            coworkAccountId: coworkAccount.id,
            role: CoworkUserRoleEnum.MANAGER
          });

          break;
        case UserRoleEnum.CLIENT:
          if (!data.client) {
            throw new AppError(AppError.VALIDATION_FAIL, 'Invalid Request');
          }

          const clientAccount = await user.useTransaction(trx).related('clientAccount').create({
            companyName: data.client.company_name,
            companyPhone: data.client.company_phone,
            companyEmail: data.client.company_email,
            companyPhotoId: data.client.company_photo_id
          });

          if (data.client.company_address) {
            const newCompanyAddress = await new Address()
              .merge(data.client.company_address)
              .useTransaction(trx)
              .save();

            await clientAccount
              .useTransaction(trx)
              .related('companyAddress')
              .associate(newCompanyAddress);
          }

          await Team.create(
            {
              clientAccountId: clientAccount.id
            },
            { client: trx }
          );

          break;
      }

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    if (data.role === UserRoleEnum.COWORKING && coworkAccountId) {
      try {
        await StripeConnectService.createOrGetAccount(coworkAccountId);
      } catch (error) {
        Logger.error(
          { err: error, userId: user.id, coworkAccountId },
          'Failed to create Stripe Connect account during signup. User created successfully; Stripe setup deferred.'
        );
      }
    }

    try {
      await this.sendConfirmationEmail(user.id);
    } catch (error) {
      Logger.error(
        { err: error, userId: user.id },
        'Failed to send confirmation email during signup. User can request resend via /auth/resend-email-confirmation.'
      );
    }

    Event.emit('user:new', { id: user.id });

    return user;
  }

  static async sendConfirmationEmail(id: number) {
    const activation = await this.createEmailActivationToken(id);
    await activation.load('user');

    await Mail.send((message) => {
      message
        .from(Env.get('SES_MAIL_FROM'), Env.get('SES_MAIL_FROM_NAME'))
        .to(activation.user.email, activation.user.firstName)
        .subject('Confirm E-mail Address')
        .htmlView('emails/global/account_confirmation', {
          ...activation.user.toJSON(),
          token: `${ApplicationUrls.AUTH.VERIFY_EMAIL}${activation.token}`
        });
    });

    Logger.info(
      { userId: id, email: activation.user.email },
      'Confirmation email queued for delivery'
    );
  }

  private static async createEmailActivationToken(id: number): Promise<UserEmailActivation> {
    await UserEmailActivation.query().where('user_id', id).delete();

    const user = await User.findOrFail(id);

    const activation = await user.related('userEmailActivationTokens').create({
      token: Crypto.randomBytes(20).toString('hex')
    });

    return activation;
  }

  static async sendLostPasswordEmail(email: string) {
    const token = await this.createLostPasswordToken(email);
    await token.load('user');

    await Mail.send((message) => {
      message
        .from(Env.get('SES_MAIL_FROM'), Env.get('SES_MAIL_FROM_NAME'))
        .to(token.user.email, token.user.firstName)
        .subject('Lost Password')
        .htmlView('emails/global/password_reset', {
          ...token.user.toJSON(),
          token: `${ApplicationUrls.AUTH.LOST_PASSWORD_FORM}${token.token}`
        });
    });
  }

  private static async createLostPasswordToken(email: string): Promise<UserLostPassword> {
    const user = await User.findByOrFail('email', email);

    await UserLostPassword.query().where('user_id', user.id).delete();

    const lostPassword = await user.related('userLostPassword').create({
      token: Crypto.randomBytes(20).toString('hex')
    });

    return lostPassword;
  }

  static async getCoworkAccountId(userId: number) {
    const user = await User.query()
      .preload('coworkUser')
      .where('id', userId)
      .where('role', UserRoleEnum.COWORKING)
      .firstOrFail();

    return user.coworkUser.coworkAccountId;
  }

  static async show(user: User) {
    const resource = User.query()
      .where('id', user.id)
      .whereNull('deleted_at')
      .preload('personalAddress')
      .preload('photo');

    if (user.role === UserRoleEnum.COWORKING || user.role === UserRoleEnum.ADMIN) {
      resource.preload('coworkUser', (query) => {
        query.preload('coworkModules');
        query.preload('coworkAccount', (query) => {
          query.preload('photo');
        });
      });
    }

    if (user.role === UserRoleEnum.CLIENT) {
      resource.preload('clientAccount', (query) => {
        query.preload('companyPhoto');
        query.preload('companyAddress');
      });
    }

    return await resource;
  }

  static async update(data: any = {}, user: User) {
    const trx = await Database.transaction();

    try {
      await user
        .useTransaction(trx)
        .merge({
          firstName: data.first_name,
          middleName: data.middle_name,
          lastName: data.last_name,
          //email: data.email,
          photoId: data.photo_id,
          personalPhone: data.personal_phone
        })
        .save();

      if (data.personal_address) {
        const personalAddress = await Address.findBy('id', user.personalAddressId);

        if (!personalAddress) {
          const newPersonalAddress = await new Address()
            .merge({
              fulltext: data.personal_address.fulltext,
              latitude: data.personal_address.latitude,
              longitude: data.personal_address.longitude,
              city: data.personal_address.city,
              state: data.personal_address.state,
              country: data.personal_address.country
            })
            .useTransaction(trx)
            .save();

          await user.useTransaction(trx).related('personalAddress').associate(newPersonalAddress);
        } else {
          await personalAddress
            .merge({
              fulltext: data.personal_address.fulltext,
              latitude: data.personal_address.latitude,
              longitude: data.personal_address.longitude,
              city: data.personal_address.city,
              state: data.personal_address.state,
              country: data.personal_address.country
            })
            .useTransaction(trx)
            .save();
        }
      }

      switch (user.role) {
        case UserRoleEnum.COWORKING:
          const coworkUser = await CoworkUser.findByOrFail('user_id', user.id);

          if (coworkUser.role !== 'MANAGER') {
            delete data.cowork;
          }

          if (!data.cowork && coworkUser.role === 'MANAGER') {
            throw new AppError(AppError.VALIDATION_FAIL, 'Invalid Request');
          }

          const coworkAccount = await CoworkAccount.findByOrFail('id', coworkUser.coworkAccountId);
          await coworkAccount
            .merge({
              name: data.cowork.name,
              email: data.cowork.email,
              phone: data.cowork.phone,
              photoId: data.cowork.photo_id
            })
            .useTransaction(trx)
            .save();

          break;

        case UserRoleEnum.CLIENT:
          if (!data.client) {
            throw new AppError(AppError.VALIDATION_FAIL, 'Invalid Request');
          }

          const clientAccount = await ClientAccount.findByOrFail('user_id', user.id);
          await clientAccount
            .merge({
              companyName: data.client.company_name,
              companyEmail: data.client.company_email,
              companyPhone: data.client.company_phone,
              companyPhotoId: data.client.company_photo_id
            })
            .useTransaction(trx)
            .save();

          if (data.client.company_address) {
            const companyAddress = await Address.findBy('id', clientAccount.companyAddressId);

            if (!companyAddress) {
              const newCompanyAddress = await new Address()
                .merge({
                  fulltext: data.client.company_address.fulltext,
                  latitude: data.client.company_address.latitude,
                  longitude: data.client.company_address.longitude,
                  country: data.client.company_address.country
                })
                .useTransaction(trx)
                .save();

              await clientAccount
                .useTransaction(trx)
                .related('companyAddress')
                .associate(newCompanyAddress);
            } else {
              await companyAddress
                .merge({
                  fulltext: data.client.company_address.fulltext,
                  latitude: data.client.company_address.latitude,
                  longitude: data.client.company_address.longitude,
                  country: data.client.company_address.country
                })
                .useTransaction(trx)
                .save();
            }
          }
          break;
      }

      await trx.commit();

      const coworkClient: CoworkClient[] = await CoworkClient.query().where('user_id', user.id);

      const coworksAccountsIds = coworkClient.map((c) => c.coworkAccountId);

      for (const cowork of coworksAccountsIds) {
        await NotificationsService.create({
          title: 'Profile Updated',
          message: `${user.fullName} has updated their profile`,
          type: NotificationTypeEnum.COWORK,
          client_id: user.id,
          cowork_account_id: cowork
        });
      }
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async import(file: any) {
    let emails: any = [];

    try {
      if (!file) {
        throw new AppError(AppError.NOT_FOUND, 'File not found.');
      }
      // Lote 5b: nome 100% backend-controlled — file.extname pode ser arbitrario.
      const safeName = safeRandomName(file.extname, ['xlsx', 'xls', 'csv']);
      await file.move(Application.tmpPath('uploads'), {
        name: safeName,
        overwrite: true
      });

      let doc = await xlsx.parse(`${__dirname}/../../tmp/uploads/${safeName}`);

      delete doc[0].data[0];
      let clientsJSon: any[] = doc[0].data.filter((item: any) => item.length > 0);

      clientsJSon.map(async (item: any) => {
        const data = {
          first_name: item[0],
          middle_name: item[1],
          last_name: item[2],
          password: `${item[4]}`,
          password_confirmation: `${item[4]}`,
          email: item[3],
          personal_phone: `${item[5]}`,
          photo_id: null,
          personal_address: {
            fulltext: item[6],
            city: item[7],
            state: item[8],
            country: item[9],
            latitude: Number(item[10]),
            longitude: Number(item[11])
          },
          client: {
            company_name: item[12],
            company_email: item[13],
            company_phone: item[14],
            company_photo_id: null,
            company_address: {
              fulltext: item[15],
              city: item[16],
              state: item[17],
              country: item[18],
              latitude: Number(item[19]),
              longitude: Number(item[20])
            }
          }
        };

        // validation
        const validateEmail = await User.findBy('email', item[3]);
        
        if( Number.isNaN(Number(item[10])) || Number.isNaN(Number(item[11])) || Number.isNaN(Number(item[19])) || Number.isNaN(Number(item[20]))) {
          return {
            message: 'Longitude and latitude must me at least 0.'
          };
        }

        if (validateEmail) {
          emails.push(item[3]);
          return emails;
        } else {
          await this.store(data);
        }
      });

      if (emails.length > 0) {
        return {
          message: 'The following emails are already registered.',
          emails: emails
        };
      } else {
        return {
          message: 'All data has been imported successfully.'
        };
      }
    } catch (error) {
      return error.message;
    }
  }
}
