import Mail from '@ioc:Adonis/Addons/Mail';
import Env from '@ioc:Adonis/Core/Env';
import Database from '@ioc:Adonis/Lucid/Database';
import CoworkUser from 'App/Models/CoworkUser';
import Mailbox from 'App/Models/Mailbox';
import MailboxHistory from 'App/Models/MailboxHistory';
import User from 'App/Models/User';
import NotificationsService from 'App/Services/NotificationsService';
import AppError from 'App/Utils/AppError';
import ApplicationUrls from 'App/Utils/ApplicationUrls';
import { MailboxClientEnum, MailboxHistoryStatus, NotificationTypeEnum } from 'Contracts/enums';
import { DateTime } from 'luxon';

export default class MailboxService {
  static async index(user: User, page = 1) {
    const query = Mailbox.query()
      .where('user_id', user.id)
      .whereNull('mailboxes.deleted_at')
      .preload('photos')
      .preload('location')
      .preload('clientAccount');

    return await query.paginate(page, Env.get('ITEMS_PER_PAGE'));
  }

  static async show(user: User, id: number) {
    const mailbox: Mailbox = await Mailbox.query()
      .preload('photos')
      .preload('location')
      .preload('historic')
      .where('id', id)
      .where('user_id', user.id)
      .first();

    if (!mailbox) {
      throw new AppError(AppError.NOT_FOUND, 'Not found');
    }

    await this.setViewed(id);

    return mailbox;
  }

  static async update(id: number, user: User, data: any = {}) {
    const mailbox: Mailbox = await Mailbox.query()
      .preload('location')
      .preload('clientAccount')
      .preload('photos')
      .where('id', id)
      .first();

    if (user.clientAccount.id !== mailbox.clientAccountId) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const trx = await Database.transaction();

    try {
      const coworkUser = await CoworkUser.query()
        .where('cowork_account_id', mailbox.location.coworkAccountId)
        .first();
      const manager = await User.query().where('id', coworkUser.userId).first();

      if (!manager) {
        throw new AppError(AppError.BAD_REQUEST, 'Related coworking not found');
      }

      if (mailbox.requestedAction !== data.requested_action) {
        await NotificationsService.create({
          title: 'Mailbox action',
          message: `The client ${user.fullName} requested an action.`,
          type: NotificationTypeEnum.COWORK,
          client_id: mailbox.clientAccount.userId,
          cowork_account_id: mailbox.location.coworkAccountId
        });
      }

      const historic = new MailboxHistory();

      mailbox.requestedAction = data.requested_action;
      historic.status = data.requested_action;

      if (data.forward_observation) {
        mailbox.forwardObservation = data.forward_observation;
        historic.message = data.forward_observation;
      }

      await mailbox.save();
      await mailbox.related('historic').create(historic);

      let mailboxAction: string;

      switch (mailbox.requestedAction) {
        case MailboxClientEnum.FORWARD:
          mailboxAction = 'Forward';
          break;
        case MailboxClientEnum.HOLD_LOCATION:
          mailboxAction = 'Hold';
          break;
        case MailboxClientEnum.PICK_UP:
          mailboxAction = 'Hold that it will be picked up';
          break;
        case MailboxClientEnum.TRASH:
          mailboxAction = 'Trash';
          break;
        default:
          mailboxAction = '';
      } // end swith case

      await this.sendEmailCoworking(
        manager,
        user,
        mailboxAction,
        mailbox.location.name,
        mailbox.deliveryDate.toLocaleString(DateTime.DATE_FULL),
        mailbox.additionalInformation,
        mailbox.id
      );

      return mailbox;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async setViewed(id: number) {
    const hasHistory = await MailboxHistory.query()
      .where('mailbox_id', id)
      .where('status', MailboxHistoryStatus.VIEWED)
      .first();

    if (hasHistory) {
      return;
    }

    await MailboxHistory.create({
      mailboxId: id,
      status: MailboxHistoryStatus.VIEWED
    });
  }

  static async sendEmailCoworking(
    manager: User,
    client: User,
    requestedAction: string,
    locationName: string,
    receiptDate: string,
    deliveryNote: string,
    mailboxId: number
  ) {
    Mail.send((message) => {
      message
        .from(Env.get('SES_MAIL_FROM'), Env.get('SES_MAIL_FROM_NAME'))
        .to(manager.email, manager.firstName)
        .subject('Delivery action')
        .htmlView('emails/coworking/mailbox/delivery_action', {
          managerName: manager.firstName,
          clientFirstName: client.firstName,
          requestedAction: requestedAction,
          locationName: locationName,
          receiptDate: receiptDate,
          deliveryNote: deliveryNote,
          token: `${ApplicationUrls.AUTH.MAILBOX_COWORKING}` + mailboxId
        });
    });
  } // end sendEmailCoworking
}
