import Mail from '@ioc:Adonis/Addons/Mail';
import Env from '@ioc:Adonis/Core/Env';
import Event from '@ioc:Adonis/Core/Event';
import Database, { TransactionClientContract } from '@ioc:Adonis/Lucid/Database';
import Address from 'App/Models/Address';
import ClientAccount from 'App/Models/ClientAccount';
import Contract from 'App/Models/Contract';
import CoworkAccount from 'App/Models/CoworkAccount';
import CoworkClient from 'App/Models/CoworkClient';
import DayPass from 'App/Models/DayPass';
import Desk from 'App/Models/Desk';
import Invoice from 'App/Models/Invoice';
import Mailbox from 'App/Models/Mailbox';
import Meeting from 'App/Models/Meeting';
import Room from 'App/Models/Room';
import Team from 'App/Models/Team';
import TeamMember from 'App/Models/TeamMember';
import User from 'App/Models/User';
import UserLostPassword from 'App/Models/UserLostPassword';
import ClientAuthorizationService from 'App/Services/Client/ClientAuthorizationService';
import ContractService from 'App/Services/Cowork/ContractService';
import InvoiceService from 'App/Services/Cowork/InvoiceService';
import AppError from 'App/Utils/AppError';
import ApplicationUrls from 'App/Utils/ApplicationUrls';
import {
  ContractStatusEnum,
  DayPassPaymentMethodEnum,
  DayPassStatusEnum,
  DayPassUserTypeEnum,
  InvoiceStatusEnum,
  MeetingPaymentMethodEnum,
  MeetingStatusEnum,
  ServicesEnum,
  UserRoleEnum
} from 'Contracts/enums';
import Crypto from 'crypto';
import jsonXlsx from 'json-as-xlsx';
import Pick from 'lodash/pick';
import { DateTime, Duration } from 'luxon';

interface FilterSearch {
  general_query?: any;

  due_date_start?: string;
  due_date_end?: string;

  contr_virtual_office?: boolean;
  contr_shared_desk?: boolean;
  contr_shared_office?: boolean;
  contr_meeting_room?: boolean;
  contr_exclusive_desk?: boolean;
  contr_private_office?: boolean;

  bl_status_open?: boolean;
  bl_status_fully_paid?: boolean;
  bl_status_partially_paid?: boolean;
  bl_status_overdue?: boolean;
}

export interface ProductsAndServicesClient {
  id: number;
  type: string;
  name: string;
  service_started_date: DateTime;
  service_renew_cancel_date: DateTime;
  auto_renewal: boolean;
  document_file: string | null;
  status: string;
}

export interface UserInfo {
  id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  personal_phone: string | null;
  phone: string | null;
  email: string;
  photo: string | null;
  company_name: string | null;
  location: string | null;
  location2: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  zipcode: number | null;
}

export interface AccountMember {
  id: string;
  name: string;
  phone: string | null;
  email: string;
  photo: string | null;
}

export interface Bookings {
  id: number;
  type: string;
  name: string;
  date: DateTime;
  status: string;
}

export interface LightInvoice {
  id: number;
  user: {
    uuid: string;
  };
  uuid: string;
  date: DateTime;
  due_date: string;
  status: string;
  amount: number;
  open_amount: number;
}

export interface Mailboxes {
  id: number;
  name: string;
  photo: string | null;
  location: string;
  action: string;
  status: string;
  received: DateTime;
}

export interface AvailableCredits {
  contractId: number;
  quantity: number;
  used: number;
  availablePerMonth: number;
}

interface Overview {
  [month: number]: { [day: number]: number };
}

interface ClientSearch {
  exist: boolean;
  is_client: boolean;
  id?: number;
  full_name?: string;
  email?: string;
  personal_phone?: string | null;
  company_name?: string | null;
  photo?: string | null;
}

export interface ClientData {
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  personal_phone?: string;
  phone?: string;
  client?: ClientCompany;
  personal_address?: AddressClient;
  photo_id?: number;
}
export interface ClientCompany {
  company_name?: string;
  company_email?: string;
  company_phone?: string;
  company_address?: AddressClient;
  company_photo_id?: number;
}
interface AddressClient {
  fulltext?: string;
  fulltext2?: string;
  latitude?: number;
  longitude?: number;
  country?: string;
  city?: string;
  state?: string;
  zipcode?: number;
}
interface ContentData {
  firstname: string;
  middlename: string;
  lastname: string;
  email: string;
  password: '-';
  personal_phone: string | null;
  //email_confirmed: string | null,
  street_address: string | undefined;
  city: string | undefined | null;
  state: string | undefined | null;
  country: string | undefined | null;
  latitude: number | undefined | null;
  longitude: number | undefined | null;
  company_name: string | undefined | null;
  company_email: string | undefined | null;
  company_phone: string | undefined | null;
  company_street_address: string | undefined | null;
  company_city: string | undefined | null;
  company_state: string | undefined | null;
  company_country: string | undefined | null;
  company_latitude: number | undefined | null;
  company_longtitude: number | undefined | null;
}

export default class ClientService {
  static async list(user: User, filters: FilterSearch) {
    await user.load('coworkUser');

    const coworkClient = await CoworkClient.query().where(
      'cowork_account_id',
      user.coworkUser.coworkAccountId
    );
   
    const coworkClientUserIds = coworkClient.map((client) => client.userId);

    const query = User.query()
      .preload('photo')
      .preload('clientAccount')
      .preload('personalAddress')
      .preload('invoices')
      .preload('contracts', (contractsQuery) => {
        contractsQuery.where('status', ContractStatusEnum.ACTIVE);
        contractsQuery.where('cowork_account_id', user.coworkUser.coworkAccountId);
      })
      .whereIn('id', coworkClientUserIds)
      .where('role', UserRoleEnum.CLIENT)
      .whereNull('deleted_at');

    if (filters.general_query) {
      query.where((userQuery) => {
        userQuery.where('first_name', 'like', `%${filters.general_query}%`);
        userQuery.orWhere('last_name', 'like', `%${filters.general_query}%`);
        userQuery.orWhere('email', 'like', `%${filters.general_query}%`);
        userQuery.orWhere('personal_phone', 'like', `%${filters.general_query}%`);
        userQuery.orWhereHas('clientAccount', (clientQuery) => {
          clientQuery.where('company_name', 'like', `%${filters.general_query}%`);
        }); // to review
      });
    }

    // Filter due date
    if (filters.due_date_start && filters.due_date_end) {
      query.whereHas('invoices', (invQuery) => {
        invQuery.whereBetween('due_date', [filters.due_date_start, filters.due_date_end]);
      });
    } else if (filters.due_date_start) {
      query.whereHas('invoices', (invQuery) => {
        invQuery.where('due_date', filters.due_date_start);
      });
    } else if (filters.due_date_end) {
      query.whereHas('invoices', (invQuery) => {
        invQuery.where('due_date', filters.due_date_end);
      });
    }

    // contract filters
    if (filters.contr_virtual_office) {
      query.whereHas('contracts', (contractQuery) => {
        contractQuery.where('service_type', '=', 'VIRTUAL_OFFICE');
      }); // to review
    }

    if (filters.contr_shared_desk) {
      const usersWithContract = await query.whereHas('contracts', (contractQuery) => {
        contractQuery.where('service_type', '=', 'OPEN_DESK');
      }); // to review

      const usersIds = usersWithContract.map((users) => users.id);

      const resources = await Contract.query()
        .whereIn('user_id', usersIds)
        .andWhere('service_type', '=', 'OPEN_DESK');

      const resourceIds = resources.map((resource) => resource.resourceId);

      const desks = await Desk.query().whereIn('id', resourceIds).andWhere('shareable', 1);

      const deskIds = desks.map((desk) => desk.id);

      query.whereHas('contracts', (contractQuery) => {
        contractQuery.whereIn('resource_id', deskIds);
      });
    }

    if (filters.contr_shared_office) {
      const usersWithContract = await query.whereHas('contracts', (contractQuery) => {
        contractQuery.where('service_type', '=', 'PRIVATE_ROOM');
      }); // to review

      const usersIds = usersWithContract.map((users) => users.id);

      const resources = await Contract.query()
        .whereIn('user_id', usersIds)
        .andWhere('service_type', '=', 'PRIVATE_ROOM');

      const resourceIds = resources.map((resource) => resource.resourceId);

      const rooms = await Room.query().whereIn('id', resourceIds).andWhere('shareable', 1);

      const roomIds = rooms.map((rom) => rom.id);

      query.whereHas('contracts', (contractQuery) => {
        contractQuery.whereIn('resource_id', roomIds);
      });
    }

    if (filters.contr_meeting_room) {
      query.whereHas('contracts', (contractQuery) => {
        contractQuery.where('service_type', '=', 'MEETING_ROOM');
      }); // to review
    }

    if (filters.contr_exclusive_desk) {
      const usersWithContract = await query.whereHas('contracts', (contractQuery) => {
        contractQuery.where('service_type', '=', 'OPEN_DESK');
      }); // to review

      const usersIds = usersWithContract.map((users) => users.id);

      const resources = await Contract.query()
        .whereIn('user_id', usersIds)
        .andWhere('service_type', '=', 'OPEN_DESK');

      const resourceIds = resources.map((resource) => resource.resourceId);

      const desks = await Desk.query().whereIn('id', resourceIds).andWhere('shareable', 0);

      const deskIds = desks.map((desk) => desk.id);

      query.whereHas('contracts', (contractQuery) => {
        contractQuery.whereIn('resource_id', deskIds);
      });
    }

    if (filters.contr_private_office) {
      const usersWithContract = await query.whereHas('contracts', (contractQuery) => {
        contractQuery.where('service_type', '=', 'PRIVATE_ROOM');
      });

      const usersIds = usersWithContract.map((users) => users.id);

      const resources = await Contract.query()
        .whereIn('user_id', usersIds)
        .andWhere('service_type', '=', 'PRIVATE_ROOM');

      const resourceIds = resources.map((resource) => resource.resourceId);

      const rooms = await Room.query().whereIn('id', resourceIds).andWhere('shareable', 0);

      const roomIds = rooms.map((rom) => rom.id);

      query.whereHas('contracts', (contractQuery) => {
        contractQuery.whereIn('resource_id', roomIds);
      });
    }

    // balance status
    if (filters.bl_status_open) {
      query.whereHas('invoices', (invQuery) => {
        invQuery.where('status', 'SENT');
        invQuery.orWhere('status', 'VIEWED');
      });
    }

    if (filters.bl_status_fully_paid) {
      query.whereHas('invoices', (invQuery) => {
        invQuery.where('status', 'FULLY_PAID');
      });
    }

    if (filters.bl_status_partially_paid) {
      query.whereHas('invoices', (invQuery) => {
        invQuery.where('status', 'PARTLY_PAID');
      });
    }

    if (filters.bl_status_overdue) {
      query.whereHas('invoices', (invQuery) => {
        invQuery.where('status', 'OVERDUE');
      });
    } // to review

    const users = await query;
    let usersJSON = users.map((user) => user.serialize());

    // Add Contract Services, Open Balance and Balance Status
    for (const client of usersJSON) {
      const { id: userId } = await User.findByOrFail('uuid', client.uuid);

      client.contracted_services = client.contracts.reduce(
        (agg, curr) => [curr.service_type, ...agg],
        []
      );
      client.open_balance = await this.getClientOpenBalance(
        userId,
        user.coworkUser.coworkAccountId
      );
      client.balance_status = await this.getClientInvoiceStatus(
        userId,
        user.coworkUser.coworkAccountId
      );
      client.next_due_date = await this.getClientNextDueDate(
        userId,
        user.coworkUser.coworkAccountId
      );

      delete client.contracts;
    }

    usersJSON.sort((a, b) => a.first_name < b.first_name ? -1 : a.first_name > b.first_name ? 1 : 0)

    return usersJSON;
  }

  static async store(user: User, data: ClientData, coworkAccountId: number): Promise<User> {
    const trx = await Database.transaction();

    try {
      let userCoAccount;
      let searchUser = await User.query()
        .where('email', data.email)
        .where('role', UserRoleEnum.CLIENT)
        .first();

      if (searchUser) {
        //const searchUserCowork = await ClientAccount.query()
        const searchUserCowork = await CoworkClient.query()
          .where('user_id', searchUser.id)
          .where('cowork_account_id', coworkAccountId)
          .first();

        if (searchUserCowork) {
          throw new AppError(AppError.BAD_REQUEST, 'User is already a coworking client');
        }

        userCoAccount = searchUser;
      } else {
        const newUser = new User();

        newUser.merge(Pick(data, User.fillable));
        newUser.role = UserRoleEnum.CLIENT;
        newUser.password = Crypto.randomBytes(4).toString('hex');
        newUser.emailConfirmed = true;

        await newUser.useTransaction(trx).save();
        userCoAccount = newUser;

        if (data.personal_address) {
          const newPersonalAddress = await new Address()
            .merge(data.personal_address)
            .useTransaction(trx)
            .save();

          await userCoAccount
            .useTransaction(trx)
            .related('personalAddress')
            .associate(newPersonalAddress);
        }

        const clientAccount = await userCoAccount
          .useTransaction(trx)
          .related('clientAccount')
          .create({
            companyName: data.client?.company_name,
            companyPhone: data.client?.company_phone,
            companyEmail: data.client?.company_email,
            companyPhotoId: data.client?.company_photo_id,
            cowork_account_id: coworkAccountId
          });

        if (data.client?.company_address) {
          const newCompanyAddress = await new Address()
            .merge(data.client?.company_address)
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
      }

      await this.sendNewPasswordRequestEmail(user, userCoAccount.email, coworkAccountId, trx);
      await ClientService.attachClientUserToCowork(coworkAccountId, userCoAccount.id);
      await trx.commit();

      Event.emit('user:new_client', { id: userCoAccount.id });

      return userCoAccount;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async update(clientUUID: string, user: User, data: ClientData){
      await user.load('coworkUser');
      
      if(!user.coworkUser){
        throw new AppError(AppError.UNAUTHORIZED, 'User is not a Cowork User');
      }
      
      const userClient = await User.findByOrFail('uuid', clientUUID);

      const isCoworkClient = await CoworkClient.query()
        .where('user_id', userClient.id)
        .where('cowork_account_id', user.coworkUser.coworkAccountId)
        .first();
  
      if (!isCoworkClient) {
        throw new AppError(AppError.BAD_REQUEST, 'Client not found');
      }

      const trx = await Database.transaction()

      try {
        
        const updatedClient = await userClient.merge(Pick (data, User.fillable)).useTransaction(trx).save();
        
        if (data.personal_address) {
          const personalAddress = await Address.findBy('id', updatedClient.personalAddressId);
  
          if (!personalAddress) {
            const newPersonalAddress = await new Address()
              .merge({
                fulltext: data.personal_address.fulltext,
                fulltext2: data.personal_address.fulltext2,
                latitude: data.personal_address.latitude,
                longitude: data.personal_address.longitude,
                country: data.personal_address.country,
                city: data.personal_address.city,
                state: data.personal_address.state,
                zipcode: data.personal_address.zipcode,
              })
              .useTransaction(trx)
              .save();
  
            await user.useTransaction(trx).related('personalAddress').associate(newPersonalAddress);
          } else {
            await personalAddress
              .merge({
                fulltext: data.personal_address.fulltext,
                fulltext2: data.personal_address.fulltext2,
                latitude: data.personal_address.latitude,
                longitude: data.personal_address.longitude,
                country: data.personal_address.country,
                city: data.personal_address.city,
                state: data.personal_address.state,
                zipcode: data.personal_address.zipcode,
              })
              .useTransaction(trx)
              .save();
          }

          const clientAccount = await ClientAccount.findByOrFail('user_id', updatedClient.id);
          await clientAccount
            .merge({
              companyName: data.client?.company_name,
              companyEmail: data.client?.company_email,
              companyPhone: data.client?.company_phone,
            })
            .useTransaction(trx)
            .save();
          
        }

        await trx.commit();

        return userClient;

      } catch (error) {
        await trx.rollback();
        throw error;
      }

  }

  static async searchClientByEmail(user: User, email: string): Promise<ClientSearch> {
    await user.load('coworkUser');

    const searchUser = await User.query()
      .where('email', email)
      .where('role', UserRoleEnum.CLIENT)
      .preload('photo')
      .preload('clientAccount', (clientQuery) => {
        clientQuery.whereNull('deleted_at');
        clientQuery.preload('teamsMember', (teamsMemberQuery) => {
          teamsMemberQuery.whereNull('deleted_at');
          teamsMemberQuery.preload('team', (teamQuery) => {
            teamQuery.whereNull('deleted_at');
            teamQuery.preload('clientAccount', (clientAccountQuery) => {
              clientAccountQuery.whereNull('deleted_at');
            });
          });
        });
      })
      .first();

    if (!searchUser) {
      return {
        exist: false,
        is_client: false
      };
    }

    const checkUserIsClient = await CoworkClient.query()
      .where('user_id', searchUser.id)
      .where('cowork_account_id', user.coworkUser.coworkAccountId)
      .first();

    let companyName = '';

    if (searchUser.clientAccount && searchUser.clientAccount.companyName) {
      companyName = searchUser.clientAccount.companyName;
    } else if (
      searchUser.clientAccount.teamsMember &&
      searchUser.clientAccount.teamsMember[0]?.team?.clientAccount?.companyName
    ) {
      companyName = searchUser.clientAccount.teamsMember[0].team.clientAccount.companyName;
    }

    return {
      exist: true,
      is_client: checkUserIsClient ? true : false,
      id: searchUser.id,
      full_name: searchUser.fullName,
      email: searchUser.email,
      personal_phone: searchUser.personalPhone,
      photo: searchUser.photo ? searchUser.photo.file : null,
      company_name: companyName
    };
  }

  static async attachClientUserToCowork(
    coworkAccountId: number,
    userId: number,
    trx?: TransactionClientContract
  ) {
    const coworkClient = await CoworkClient.query()
      .where('cowork_account_id', coworkAccountId)
      .where('user_id', userId)
      .first();

    if (!coworkClient) {
      await CoworkClient.create(
        {
          userId: userId,
          coworkAccountId: coworkAccountId
        },
        { client: trx }
      );
    }
  }

  static async detachClientUserToCowork(
    user: User,
    userUuid: string,
    trx?: TransactionClientContract
  ) {
    await user.load('coworkUser');

    const findUser = await User.findByOrFail('uuid', userUuid);

    const coworkClient = await CoworkClient.query()
      .where('cowork_account_id', user.coworkUser.coworkAccountId)
      .where('user_id', findUser.id)
      .first();

    if (!coworkClient) {
      throw new AppError(AppError.NOT_FOUND, 'Client not found');
    }

    if (trx) {
      await coworkClient.useTransaction(trx).delete();
    } else {
      await coworkClient.delete();
    }
  }

  static async show(user: User, clientUUID: string): Promise<UserInfo> {
    await user.load('coworkUser');

    const userClient = await User.findByOrFail('uuid', clientUUID);

    const isCoworkClient = await CoworkClient.query()
      .where('user_id', userClient.id)
      .where('cowork_account_id', user.coworkUser.coworkAccountId)
      .first();

    if (!isCoworkClient) {
      throw new AppError(AppError.BAD_REQUEST, 'Client not found');
    }

    await userClient.load('clientAccount');
    await userClient.load('photo');
    await userClient.load('personalAddress');

    return {
      id: userClient.uuid,
      first_name: userClient.firstName,
      middle_name: userClient.middleName,
      last_name: userClient.lastName,
      email: userClient.email,
      personal_phone: userClient.personalPhone,
      phone: userClient.phone,
      photo: userClient.photo ? userClient.photo.file : null,
      company_name: userClient?.clientAccount?.companyName,
      location: userClient?.personalAddress?.fulltext,
      location2: userClient?.personalAddress?.fulltext2,
      country: userClient?.personalAddress?.country,
      state: userClient?.personalAddress?.state,
      city: userClient?.personalAddress?.city,
      zipcode: userClient?.personalAddress?.zipcode,
    };
  }

  static async accountMembers(
    user: User,
    clientUUID: string,
    filter: any = {}
  ): Promise<AccountMember[]> {
    await user.load('coworkUser');
    const members: AccountMember[] = [];

    const client: User = await User.findByOrFail('uuid', clientUUID);

    const clientCowork = await CoworkClient.query()
      .where('user_id', client.id)
      .where('cowork_account_id', user.coworkUser.coworkAccountId)
      .first();

    if (clientCowork && client) {
      await client.load('clientAccount');
      if (!client.clientAccount) {
        throw new AppError(AppError.BAD_REQUEST, 'Client not found');
      }
      const team: Team = await Team.findByOrFail('client_account_id', client?.clientAccount?.id);

      const teamMembers = await TeamMember.query()
        .where('team_id', team.id)
        .preload('clientAccount');

      const userIds = teamMembers.map((member) => member.clientAccount.userId);
      const query = User.query().whereIn('id', userIds).preload('clientAccount').preload('photo');

      if (filter.q) {
        query.andWhere((q) => {
          q.andWhere('first_name', 'like', `%${filter.q}%`)
            .orWhere('last_name', 'like', `%${filter.q}%`)
            .orWhere('email', 'like', `%${filter.q}%`);
        });
      }

      const users = await query;

      for (const member of users) {
        members.push({
          id: member.uuid,
          name: member.fullName,
          email: member.email,
          phone: member.personalPhone,
          photo: member.photo ? member.photo.file : null
        });
      }

      return members;
    }

    throw new AppError(AppError.BAD_REQUEST, 'Client not found');
  }

  static async overview(user: User, clientUUID: string) {
    await user.load('coworkUser');
    const client = await User.findByOrFail('uuid', clientUUID);
    const meetings: Meeting[] = await Meeting.query()
      .select(Database.raw('DAY(created_at) as day, MONTH(created_at) as month, COUNT(*) as qty'))
      .where('cowork_account_id', user.coworkUser.coworkAccountId)
      .where('user_id', client.id)
      .where('status', MeetingStatusEnum.APPROVED)
      .whereRaw('YEAR(created_at) = YEAR(now())')
      .groupByRaw('DAY(created_at), MONTH(created_at)');

    const dayPass: DayPass[] = await DayPass.query()
      .select(Database.raw('DAY(created_at) as day, MONTH(created_at) as month, COUNT(*) as qty'))
      .where('cowork_account_id', user.coworkUser.coworkAccountId)
      .where('user_type', DayPassUserTypeEnum.CLIENT)
      .where('client_id', client.id)
      .where('status', DayPassStatusEnum.APPROVED)
      .whereRaw('YEAR(created_at) = YEAR(now())')
      .groupByRaw('DAY(created_at), MONTH(created_at)');

    const records = [...meetings.map((m) => m.$extras), ...dayPass.map((m) => m.$extras)];
    const recordsGrouped: Overview = {};

    records.forEach((r) => {
      if (recordsGrouped.hasOwnProperty(r.month)) {
        if (recordsGrouped[r.month].hasOwnProperty(r.day)) {
          recordsGrouped[r.month][r.day] += r.qty;
        } else {
          recordsGrouped[r.month][r.day] = r.qty;
        }
      } else {
        recordsGrouped[r.month] = {};
        recordsGrouped[r.month][r.day] = r.qty;
      }
    });

    return recordsGrouped;
  }

  static async productsAndServices(user: User, clientUUID: string) {
    await user.load('coworkUser');
    const services: ProductsAndServicesClient[] = [];
    const client = await User.findByOrFail('uuid', clientUUID);
    const contracts = await ContractService.getProductsAndContractsByUserId(
      user.coworkUser.coworkAccountId,
      client.id
    );

    for (const contract of contracts) {
      const service: ProductsAndServicesClient = {
        id: contract.id,
        type: contract.serviceType,
        name: await ContractService.getServiceName(contract),
        service_started_date: contract.service_started_date,
        service_renew_cancel_date: contract.service_renew_cancel_date,
        auto_renewal: contract.autoRenewal,
        document_file: contract.contractDocument ? contract.contractDocument.file : null,
        status: contract.status
      };

      services.push(service);
    }

    return services;
  }

  static async benefits(user: User, clientUUID: string) {
    await user.load('coworkUser');

    /**
     * Meeting Hours Usage
     */
    const client = await User.findByOrFail('uuid', clientUUID);
    const meetings: Meeting[] = await Meeting.query()
      .where('cowork_account_id', user.coworkUser.coworkAccountId)
      .where('user_id', client.id)
      .where('status', MeetingStatusEnum.APPROVED)
      .preload('billings')
      .preload('invoice');

    const meetingMinutes = meetings.reduce((pre, cur) => (pre += cur.quantityMinutes), 0);
    const meetingHours = Duration.fromObject({ minutes: meetingMinutes })
      .shiftTo('hours', 'minutes')
      .toFormat('hh:mm');

    const meetingHoursUsage = { paid: 0, included: 0, free: 0 };

    for (const meeting of meetings) {
      let paid = 0;
      let free = 0;
      let included = 0;

      if (meeting.paymentMethod === MeetingPaymentMethodEnum.BENEFIT) {
        for (const billing of meeting.billings) {
          paid += billing.quantityMinutes;
        }

        included = meeting.quantityMinutes - paid;
      }

      if (
        meeting.paymentMethod === MeetingPaymentMethodEnum.BILLING ||
        meeting.paymentMethod === MeetingPaymentMethodEnum.PAY_SPACE
      ) {
        paid += meeting.quantityMinutes;
      }

      if (meeting.paymentMethod === MeetingPaymentMethodEnum.CAPTURE) {
        if (meeting.invoice.status === InvoiceStatusEnum.FULLY_PAID) {
          paid += meeting.quantityMinutes;
        }
      }

      if (meeting.paymentMethod === MeetingPaymentMethodEnum.COURTESY) {
        free = meeting.quantityMinutes;
      }

      meetingHoursUsage.paid += paid;
      meetingHoursUsage.free += free;
      meetingHoursUsage.included += included;
    }

    /**
     * Desk Days Usage
     */
    const deskDayPass: DayPass[] = await DayPass.query()
      .where('cowork_account_id', user.coworkUser.coworkAccountId)
      .where('user_type', DayPassUserTypeEnum.CLIENT)
      .where('space', ServicesEnum.OPEN_DESK)
      .where('client_id', client.id)
      .where('status', DayPassStatusEnum.APPROVED);

    const deskTotalDaysUsage = deskDayPass.length;
    const deskDaysUsage = { paid: 0, included: 0, free: 0 };

    for (const dayPass of deskDayPass) {
      switch (dayPass.paymentMethod) {
        case DayPassPaymentMethodEnum.BENEFIT:
          deskDaysUsage.included += 1;
          break;
        case DayPassPaymentMethodEnum.CAPTURE:
          deskDaysUsage.paid += 1;
          break;
        case DayPassPaymentMethodEnum.COURTESY:
          deskDaysUsage.free += 1;
          break;
      }
    }

    /**
     * Credits Usage
     */
    const totalCreditsUsage = 0;
    const creditsUsage = {
      included: meetingHoursUsage.included + deskDaysUsage.included,
      free: meetingHoursUsage.free + deskDaysUsage.free
    };

    return {
      meetingHours,
      meetingHoursUsage,
      deskTotalDaysUsage,
      deskDaysUsage,
      totalCreditsUsage,
      creditsUsage
    };
  }

  static async bookings(user: User, clientUUID: string) {
    await user.load('coworkUser');
    const bookings: Bookings[] = [];
    const client = await User.findByOrFail('uuid', clientUUID);
    const meetings: Meeting[] = await Meeting.query()
      .where('cowork_account_id', user.coworkUser.coworkAccountId)
      .where('user_id', client.id)
      .preload('meetroom');

    for (const meeting of meetings) {
      bookings.push({
        id: meeting.id,
        type: ServicesEnum.MEETING_ROOM,
        name: meeting.meetroom.name,
        date: meeting.createdAt,
        status: meeting.status
      });
    }

    return bookings;
  }

  static async invoices(user: User, clientUUID: string) {
    await user.load('coworkUser');
    const invoices: LightInvoice[] = [];
    const client = await User.findByOrFail('uuid', clientUUID);
    const result: Invoice[] = await Invoice.query()
      .where('cowork_account_id', user.coworkUser.coworkAccountId)
      .where('user_id', client.id);

    for (const invoice of result) {
      const detailed = await invoice.getDetailed();
      if (!detailed?.user?.uuid) {
        throw new AppError(AppError.BAD_REQUEST, 'Invoice user not found');
      }

      invoices.push({
        id: invoice.id,
        uuid: invoice.uuid,
        user: {
          uuid: detailed.user.uuid
        },
        date: invoice.date,
        status: detailed.status,
        amount: detailed.total,
        due_date: detailed.due_date,
        open_amount: detailed.open_amount
      });
    }

    return invoices;
  }

  static async mailbox(user: User, clientUUID: string) {
    await user.load('coworkUser');
    const mailboxes: Mailboxes[] = [];
    const client = await User.findByOrFail('uuid', clientUUID);
    const result: Mailbox[] = await Mailbox.query()
      .preload('clientAccount', (clientAccount) => {
        clientAccount.preload('user');
      })
      .preload('photos')
      .preload('location')
      .whereHas('clientAccount', (clientAccountQuery) => {
        clientAccountQuery.whereNull('deleted_at');
        clientAccountQuery.where('user_id', client.id);
        clientAccountQuery.whereHas('user', (u) => {
          u.whereNull('deleted_at');
        });
      })
      .whereHas('location', (locationQuery) => {
        locationQuery.where('cowork_account_id', user.coworkUser.coworkAccountId);
        locationQuery.whereNull('deleted_at');
      });

    for (const mailbox of result) {
      mailboxes.push({
        id: mailbox.id,
        name: client.fullName,
        photo: mailbox.photos.length > 0 && mailbox.photos[0].file ? mailbox.photos[0].file : null,
        location: mailbox.location.name,
        action: mailbox.requestedAction,
        status: mailbox.status,
        received: mailbox.deliveryDate
      });
    }

    return mailboxes;
  }

  static async getServiceAvailableCreditsMonth(
    user: User,
    clientId: number,
    locationId: number,
    serviceType: string,
    resourceId?: number,
    dateBase: DateTime = DateTime.now()
  ) {
    await user.load('coworkUser');

    const isDayPass =
      serviceType === ServicesEnum.PRIVATE_ROOM || serviceType === ServicesEnum.OPEN_DESK;
    const isMeeting = serviceType === ServicesEnum.MEETING_ROOM;
    const result: AvailableCredits[] = [];
    const client = await User.findOrFail(clientId);
    await client.load('clientAccount');

    let allContracts: Contract[] = [];

    // Check if client is part of a team
    const clientTeam = await ClientAuthorizationService.getClientTeam(client.clientAccount.id);

    if (clientTeam.clientAccountId !== client.clientAccount.id) {
      const clientAccountManager = await ClientAccount.find(clientTeam.clientAccountId);

      if (clientAccountManager) {
        const contracts: Contract[] = await Contract.query()
          .where('user_id', clientAccountManager.userId)
          .where('location_id', locationId)
          .where('cowork_account_id', user.coworkUser.coworkAccountId)
          .where('status', ContractStatusEnum.ACTIVE)
          .if(isMeeting, (query) => {
            query.where('meeting_room_usage_per_month', '>', 0);
          })
          .if(isDayPass, (query) => {
            query.where('cowork_usage_per_month', '>', 0);
          })
          .if(resourceId, (query) => {
            query.where('resource_id', resourceId);
          })
          .preload('usages', (usagesQuery) => {
            usagesQuery.where('service_type', serviceType);
            usagesQuery.whereRaw('MONTH(booking_date) = ? AND YEAR(booking_date) = ?', [
              dateBase.month,
              dateBase.year
            ]);
          });

        allContracts = [...contracts];
      }
    }

    // Client's contracts
    const contracts: Contract[] = await Contract.query()
      .where('user_id', clientId)
      .where('location_id', locationId)
      .where('cowork_account_id', user.coworkUser.coworkAccountId)
      .if(isMeeting, (query) => {
        query.where('meeting_room_usage_per_month', '>', 0);
      })
      .if(isDayPass, (query) => {
        query.where('cowork_usage_per_month', '>', 0);
      })
      .if(resourceId, (query) => {
        query.where('resource_id', resourceId);
      })
      .where('status', ContractStatusEnum.ACTIVE)
      .preload('usages', (usagesQuery) => {
        usagesQuery.where('service_type', serviceType);
        usagesQuery.whereRaw('MONTH(booking_date) = ? AND YEAR(booking_date) = ?', [
          dateBase.month,
          dateBase.year
        ]);
      });

    allContracts = [...allContracts, ...contracts];

    for (const contract of allContracts) {
      let availablePerMonth = 0;

      if (serviceType === ServicesEnum.MEETING_ROOM) {
        availablePerMonth = contract.meetingRoomUsagePerMonth;
      } else {
        availablePerMonth = contract.coworkUsagePerMonth;
      }

      const availableCredits: AvailableCredits = {
        contractId: contract.id,
        availablePerMonth: availablePerMonth,
        used: 0,
        quantity: 0
      };

      contract.usages.forEach((u) => {
        availableCredits.used += u.quantityCredits;
      });

      availableCredits.quantity = availableCredits.availablePerMonth - availableCredits.used;

      if (availableCredits.quantity) {
        result.push(availableCredits);
      }
    }

    return result;
  }

  private static async sendNewPasswordRequestEmail(
    user: User,
    email: string,
    coworkAccountId: number,
    trx: TransactionClientContract
  ) {
    const coworkAccount = await CoworkAccount.findOrFail(coworkAccountId, {
      client: trx
    });
    const token = await this.createAccountToken(email, trx);

    await token.load('user');

    Mail.send((message) => {
      message
        .from(Env.get('SES_MAIL_FROM'), Env.get('SES_MAIL_FROM_NAME'))
        .to(token.user.email, token.user.firstName)
        .subject(`You have been registered with ${coworkAccount.name}`)
        .htmlView('emails/coworking/new_client', {
          ...token.user.toJSON(),
          clientFirsName: token.user.firstName,
          invitorFirst: user.firstName,
          invitorLastName: user.lastName,
          coworkAccount: coworkAccount.toJSON(),
          coworkingName: coworkAccount.name,
          token: `${ApplicationUrls.AUTH.NEW_CLIENT}${token.token}`
        });
    });
  }

  private static async createAccountToken(
    email: string,
    trx: TransactionClientContract
  ): Promise<UserLostPassword> {
    const user = await User.findByOrFail('email', email, { client: trx });

    await UserLostPassword.query().where('user_id', user.id).useTransaction(trx).delete();

    const lostPassword = await user.related('userLostPassword').create({
      token: Crypto.randomBytes(20).toString('hex')
    });

    return lostPassword;
  }

  static async getClientOpenBalance(clientId: number, coworkAccountId: number) {
    const invoices: Invoice[] = await Invoice.query()
      .where('user_id', clientId)
      .where('cowork_account_id', coworkAccountId)
      .whereIn('status', [
        InvoiceStatusEnum.SENT,
        InvoiceStatusEnum.VIEWED,
        InvoiceStatusEnum.PARTLY_PAID
      ]);

    let total = 0;

    for (const invoice of invoices) {
      let totalInvoice = 0;
      const isOverdue = await invoice.isOverdue();

      if (isOverdue) {
        totalInvoice = invoice.total + invoice.totalTaxesOverdue;
      } else {
        totalInvoice = invoice.total;
      }

      if (
        invoice.status === InvoiceStatusEnum.PARTLY_PAID ||
        invoice.status === InvoiceStatusEnum.PARTLY_REFUNDED
      ) {
        const totalPaid = await InvoiceService.calculatePaymentsInvoices(invoice.id);
        total += totalInvoice - totalPaid;
      } else {
        total += totalInvoice;
      }
    }

    return total;
  }

  static async getClientInvoiceStatus(clientId: number, coworkAccountId: number) {
    const invoices: Invoice[] = await Invoice.query()
      .where('user_id', clientId)
      .where('cowork_account_id', coworkAccountId);

    // Check if has overdue invoice
    for (const invoice of invoices) {
      const isOverdue = await invoice.isOverdue();
      if (isOverdue) return 'OVERDUE';
    }

    // Check if has partially paid invoice
    for (const invoice of invoices) {
      if (invoice.status === InvoiceStatusEnum.PARTLY_PAID) return 'PARTLY_PAID';
    }

    // Check if has open invoices
    for (const invoice of invoices) {
      if (
        invoice.status === InvoiceStatusEnum.SENT ||
        invoice.status === InvoiceStatusEnum.VIEWED
      ) {
        return 'OPEN';
      }
    }

    return 'FULLY_PAID';
  }

  static async getClientNextDueDate(clientId: number, coworkAccountId: number) {
    const invoices: Invoice[] = await Invoice.query()
      .where('user_id', clientId)
      .where('cowork_account_id', coworkAccountId)
      .whereIn('status', [
        InvoiceStatusEnum.SENT,
        InvoiceStatusEnum.VIEWED,
        InvoiceStatusEnum.PARTLY_PAID
      ])
      .whereRaw('DATE(due_date) > DATE(NOW())')
      .orderBy('due_date', 'asc')
      .limit(1);

    if (invoices[0]) {
      return invoices[0].dueDate;
    }

    return '';
  }

  static async export(user: User) {
    //clients_id: []

    let success = 'success';

    try {
      const coworkClient = await ClientAccount.query().where(
        'cowork_account_id',
        user.coworkUser.coworkAccountId
      );

      const coworkClientUserIds = coworkClient.map((client) => client.userId);

      const clients = await User.findMany(coworkClientUserIds);

      if (clients.length > 0) {
        let data: any[] = [
          {
            sheet: 'Clients',
            columns: [
              { label: 'first_Name', value: (row) => row.firstname },
              { label: 'middle_Name', value: (row) => row.middlename },
              { label: 'last_Name', value: (row) => row.lastname },
              { label: 'email', value: (row) => row.email },
              { label: 'password', value: (row) => row.password },
              { label: 'personal_phone', value: (row) => row.personal_phone },
              //{ label: "email_confirmed", value: (row) => (row.email_confirmed) },
              { label: 'street_address', value: (row) => row.street_address },
              { label: 'city', value: (row) => row.city },
              { label: 'state', value: (row) => row.state },
              { label: 'country', value: (row) => row.country },
              { label: 'latitude', value: (row) => row.latitude },
              { label: 'longitude', value: (row) => row.longitude },
              { label: 'company_name', value: (row) => row.company_name },
              { label: 'company_email', value: (row) => row.company_email },
              { label: 'company_phone', value: (row) => row.company_phone },
              { label: 'company_street_address', value: (row) => row.company_street_address },
              { label: 'company_city', value: (row) => row.company_city },
              { label: 'company_state', value: (row) => row.company_state },
              { label: 'company_country', value: (row) => row.company_country },
              { label: 'company_latitude', value: (row) => row.company_latitude },
              { label: 'company_longtitude', value: (row) => row.company_latitude }
            ],
            content: []
          }
        ];
        const addressIds = clients.map((item) => {
          return item.personalAddressId;
        });
        const addressList = await Address.findMany(addressIds);
        clients.map(async (item) => {
          const address: Address | undefined = addressList.find(
            (el) => el.id === item.personalAddressId
          );

          const clientAccount = await ClientAccount.query().where('user_id', item.id).first();

          //console.log("item "+item.id);
          // company details
          let companyName = '';
          let companyEmail = '';
          let companyPhone = '';

          // company address details
          let companyAddFullText = '';
          let companyAddCity = '';
          let companyAddState = '';
          let companyAddCountry = '';
          let companyAddLat = 0;
          let companyAddLong = 0;

          let companyAddress: any;

          if (clientAccount) {
            companyName = clientAccount?.companyName;
            companyEmail = clientAccount?.companyEmail;
            companyPhone = clientAccount?.companyPhone;

            if (clientAccount.companyAddressId !== null) {
              //console.log(clientAccount.companyAddressId);

              companyAddress = await Address.query()
                .where('id', clientAccount.companyAddressId)
                .first();

              companyAddFullText = companyAddress?.fulltext;
              companyAddCity = companyAddress?.city;
              companyAddState = companyAddress?.state;
              companyAddCountry = companyAddress?.country;
              companyAddLat = companyAddress?.latitude;
              companyAddLong = companyAddress?.longitude;
            }
          }

          const Content: ContentData = {
            firstname: item.firstName,
            middlename: item.middleName,
            lastname: item.lastName,
            email: item.email,
            password: '-',
            personal_phone: item.personalPhone,
            //email_confirmed: item.emailConfirmed ? 'true' : 'false',
            street_address: address?.fulltext,
            city: address?.city,
            state: address?.state,
            country: address?.country,
            latitude: address?.latitude,
            longitude: address?.longitude,
            company_name: companyName,
            company_email: companyEmail,
            company_phone: companyPhone,
            company_street_address: companyAddFullText,
            company_city: companyAddCity,
            company_state: companyAddState,
            company_country: companyAddCountry,
            company_latitude: companyAddLat,
            company_longtitude: companyAddLong
          };
          data[0].content.push(Content);

          let settings = {
            fileName: 'ClientExport',
            extraLength: 3,
            writeOptions: {}
          };
          await jsonXlsx(data, settings);
        });

        return success;
      } else {
        return 'No records found.';
      }
    } catch (error) {
      return error.message;
    }
  }
}
