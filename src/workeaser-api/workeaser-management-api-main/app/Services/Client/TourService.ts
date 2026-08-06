import Event from '@ioc:Adonis/Core/Event';
import Database from '@ioc:Adonis/Lucid/Database';
import Location from 'App/Models/Location';
import Tour from 'App/Models/Tour';
import User from 'App/Models/User';
import NotificationsService from 'App/Services/NotificationsService';
import AppError from 'App/Utils/AppError';
import { NotificationTypeEnum } from 'Contracts/enums';
import Pick from 'lodash/pick';

export default class TourService {
  static async store(user: User, data: any = {}) {
    await user.load('clientAccount');

    const location = await Location.find(data.location_id);

    if (!location) {
      throw new AppError(AppError.NOT_FOUND, 'Location not found');
    }

    const trx = await Database.transaction();

    try {
      const newTour = await new Tour()
        .merge({
          ...Pick(data, Tour.fillable),
          locationId: data.location_id,
          userId: user.id
        })
        .useTransaction(trx)
        .save();

      // const services = data.services.map((s) => ({
      //   serviceId: s.id,
      //   leadId: lead.id
      // }));

      // await LeadOpportunity.fetchOrCreateMany(['leadId', 'serviceId'], services, {
      //   client: trx
      // });

      await trx.commit();

      Event.emit('tour:requested', { id: newTour.id });

      await NotificationsService.create({
        title: 'Tour request',
        type: NotificationTypeEnum.COWORK,
        message: `${user.fullName} requested a tour`,
        client_id: user.id,
        cowork_account_id: location.coworkAccountId
      });

      return newTour;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
}
