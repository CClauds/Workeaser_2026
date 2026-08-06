import User from 'App/Models/User';
import Notification from 'App/Models/Notification';
import { DateTime } from 'luxon';
import { NotificationTypeEnum, UserRoleEnum } from 'Contracts/enums';

interface NotificationData {
  id: number;
  name: string | null;
  photo: string | null;
  title: string;
  message: string;
  is_new: boolean;
  created_at: DateTime;
}

interface NotificationInterface {
  title: string;
  message: string;
  type: string;
  client_id?: number;
  cowork_account_id?: number;
}

export default class NotificationsService {
  static async show(user: User, page = 1) {
    await user.load('coworkUser');

    const notifications = await Notification.query()
      .if(user.role === UserRoleEnum.CLIENT, (q) => {
        q.where('type', NotificationTypeEnum.CLIENT);
        q.where('client_id', user.id);
        q.preload('coworkAccount', (c) => {
          c.preload('photo');
        });
      })
      .if(user.role === UserRoleEnum.COWORKING, (q) => {
        q.where('type', NotificationTypeEnum.COWORK);
        q.where('cowork_account_id', user.coworkUser.coworkAccountId);
        q.preload('client', (c) => {
          c.preload('photo');
        });
      })
      .orderBy('read', 'asc')
      .orderBy('created_at', 'desc')
      .paginate(page, 10);

    const notificationToUpdate = notifications.all().map((n) => n.id);
    await Notification.query().whereIn('id', notificationToUpdate).update('read', true);

    const notificationsJson = notifications.toJSON();
    const notificationsFormatted: NotificationData[] = [];

    notificationsJson.data.forEach((n) => {
      let userName: string | null = null;
      let userPhoto: string | null = null;

      if (n.type === NotificationTypeEnum.COWORK) {
        userPhoto = n.client?.photo?.file;
        userName = n.client?.fullName;
      } else if (n.type === NotificationTypeEnum.CLIENT) {
        userPhoto = n.coworkAccount?.photo?.file;
        userName = n.coworkAccount?.name;
      }

      notificationsFormatted.push({
        id: n.id,
        title: n.title,
        message: n.message,
        is_new: !n.read,
        created_at: n.createdAt,
        name: userName,
        photo: userPhoto
      });
    });

    notificationsJson.data = notificationsFormatted;

    return {
      toJSON() {
        return notificationsJson;
      }
    };
  }

  static async count(user: User) {
    await user.load('coworkUser');

    const notifications = await Notification.query()
      .if(user.role === UserRoleEnum.CLIENT, (q) => {
        q.where('type', NotificationTypeEnum.CLIENT);
        q.where('client_id', user.id);
      })
      .if(user.role === UserRoleEnum.COWORKING, (q) => {
        q.where('type', NotificationTypeEnum.COWORK);
        q.where('cowork_account_id', user.coworkUser.coworkAccountId);
      })
      .where('read', 0)
      .count({ total: '*' });

    return {
      total: notifications[0].$extras.total
    };
  }

  static async create(notification: NotificationInterface) {
    const newNotification = await Notification.create({
      clientId: notification.client_id,
      coworkAccountId: notification.cowork_account_id,
      type: notification.type,
      title: notification.title,
      message: notification.message
    });

    return newNotification;
  }

  static async delete(user: User, notificationId: number) {
    if (user.role === UserRoleEnum.COWORKING) {
      await user.load('coworkUser');
    }

    const notification = await Notification.query()
      .if(user.role === UserRoleEnum.CLIENT, (q) => {
        q.where('type', NotificationTypeEnum.CLIENT);
        q.where('client_id', user.id);
      })
      .if(user.role === UserRoleEnum.COWORKING, (q) => {
        q.where('type', NotificationTypeEnum.COWORK);
        q.where('cowork_account_id', user.coworkUser.coworkAccountId);
      })
      .where('id', notificationId)
      .first();

    if (notification) {
      await notification.delete();
    }
  }
}
