import Mail from '@ioc:Adonis/Addons/Mail';
import Env from '@ioc:Adonis/Core/Env';
import Database from '@ioc:Adonis/Lucid/Database';
import CoworkAccount from 'App/Models/CoworkAccount';
import Location from 'App/Models/Location';
import Mailbox from 'App/Models/Mailbox';
import MailboxHistory from 'App/Models/MailboxHistory';
import User from 'App/Models/User';
import AppError from 'App/Utils/AppError';
import ApplicationUrls from 'App/Utils/ApplicationUrls';
import { MailboxCoworkingEnum } from 'Contracts/enums';
import Pick from 'lodash/pick';
import { DateTime } from 'luxon';

export default class MailboxService {
  static async index(user: User, page = 1) {
    await user.load('coworkUser');

    const query = Mailbox.query()
      .whereHas('location', (locationQuery) => {
        locationQuery.where('cowork_account_id', user.coworkUser.coworkAccountId);
        locationQuery.whereNull('deleted_at');
      })
      .preload('photos')
      .preload('location', (loc) => {
        loc.preload('address');
      })
      .preload('clientAccount');

    return await query.paginate(page, Env.get('ITEMS_PER_PAGE'));
  }

  static async show(id: number, user: User) {
    await user.load('coworkUser');

    const mailbox = await Mailbox.query()
      .where('id', id)
      .whereNull('deleted_at')
      .preload('photos')
      .preload('historic')
      .preload('user')
      .preload('location', (query) => {
        query.preload('coworkAccount');
        query.preload('address');
      })
      .whereHas('location', (locationQuery) => {
        locationQuery.where('cowork_account_id', user.coworkUser.coworkAccountId);
        locationQuery.whereNull('deleted_at');
      })
      .first();

    if (!mailbox) {
      throw new AppError(AppError.NOT_FOUND, 'Mailbox not found');
    }

    return mailbox;
  }

  static async store(user: User, data: any = {}) {
    const location = await Location.find(data.location_id);
    const coworkAccount = await CoworkAccount.findOrFail(user.coworkUser.coworkAccountId);
    const photos = data.photos.length;
    const clientUser = await User.findByOrFail('uuid', data.client_uuid);

    if (photos > 4) {
      throw new AppError(AppError.VALIDATION_FAIL, 'Maximum number of photos is 4');
    }

    if (!location) {
      throw new AppError(AppError.NOT_FOUND, 'Location not found');
    }

    if (coworkAccount.id !== location.coworkAccountId) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const trx = await Database.transaction();

    try {
      await clientUser.load('clientAccount');
      const mailbox = await new Mailbox()
        .merge({
          ...Pick(data, Mailbox.fillable),
          locationId: data.location_id,
          clientAccountId: clientUser.clientAccount.id,
          userId: clientUser.id
        })
        .useTransaction(trx)
        .save();

      if (data.photos) {
        const photos = data.photos.filter((p) => !!p.id).map((p) => p.id);
        await mailbox.related('photos').attach(photos);
      } // end if data.photos

      await mailbox.related('historic').create({
        status: MailboxCoworkingEnum.HOLDING,
        message: mailbox.additionalInformation
      });

      await trx.commit();

      await this.sendEmailClient(
        clientUser,
        user,
        location.name,
        data.delivery_date.toLocaleString(DateTime.DATE_FULL),
        data.additional_information,
        mailbox.id
      );

      return mailbox;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async update(id: string, user: User, data: any = {}) {
    const mailbox = await Mailbox.findOrFail(id);
    const location = await Location.findOrFail(mailbox.locationId);
    const coworkAccount = await CoworkAccount.findOrFail(user.coworkUser.coworkAccountId);

    if (coworkAccount.id !== location.coworkAccountId) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const historic = new MailboxHistory();

    if (
      mailbox.status === MailboxCoworkingEnum.FORWARDED &&
      data.status !== MailboxCoworkingEnum.FORWARDED
    ) {
      mailbox.forwardObservation = null;
    }

    if (data.forward_observation && data.status === MailboxCoworkingEnum.FORWARDED) {
      mailbox.forwardObservation = data.forward_observation;
      historic.message = data.forward_observation;
    }

    historic.status = data.status;
    mailbox.status = data.status;

    await mailbox.save();
    await mailbox.related('historic').create(historic);

    return mailbox;
  }

  static async sendEmailClient(
    client: User,
    manager: User,
    locationName: string,
    receiptDate: string,
    deliveryNote: string,
    mailboxId: number
  ) {
    await Mail.send((message) => {
      message
        .from(Env.get('SES_MAIL_FROM'), Env.get('SES_MAIL_FROM_NAME'))
        .to(client.email, client.firstName)
        .subject('You have a new delivery')
        .htmlView('emails/coworker/mailbox/new_delivery', {
          managerName: manager.firstName,
          clientFirstName: client.firstName,
          locationName: locationName,
          receiptDate: receiptDate,
          deliveryNote: deliveryNote,
          token:
            `${ApplicationUrls.AUTH.MAILBOX_COWORKER}` +
            manager.coworkUser.coworkAccountId +
            '/mailbox-manager/' +
            mailboxId
        });
    });
  }
}
