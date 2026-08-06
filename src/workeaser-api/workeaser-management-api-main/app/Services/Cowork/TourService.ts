import Env from '@ioc:Adonis/Core/Env';
import Event from '@ioc:Adonis/Core/Event';
import Database from '@ioc:Adonis/Lucid/Database';
import Location from 'App/Models/Location';
import Tour from 'App/Models/Tour';
import User from 'App/Models/User';
import CalendarService from 'App/Services/Cowork/CalendarService';
import AppError from 'App/Utils/AppError';
import { EventBookingTypes, ToursStatusEnum } from 'Contracts/enums';
import Pick from 'lodash/pick';
import { DateTime } from 'luxon';

export default class TourService {
  static async list(user: User, filters: any, paginate = true, page = 1) {
    await user.load('coworkUser');

    const query = Tour.query()
      .preload('location')
      .preload('user')
      .whereHas('location', (locationQuery) => {
        locationQuery.where('cowork_account_id', user.coworkUser.coworkAccountId);
      })
      .where('deleted_at', null);

    if (filters.name) {
      query.whereHas('user', (userQuery) => {
        userQuery
          .where('first_name', 'like', `%${filters.name}%`)
          .orWhere('last_name', 'like', `%${filters.name}%`);
      });
    }

    if (filters.email) {
      query.whereHas('lead', (leadQuery) => {
        leadQuery.whereHas('clientAccount', (accountQuery) => {
          accountQuery.whereHas('user', (userQuery) => {
            userQuery.where('email', filters.email);
          });
        });
      });
    }

    if (filters.date) {
      query.whereRaw('DATE(date_start) = ?', [filters.date]);
    }

    return (await paginate) ? query.paginate(page, Env.get('ITEMS_PER_PAGE')) : query;
  }

  static async show(id: number, user: User) {
    await user.load('coworkUser');

    const tour = await Tour.query().where('id', id).preload('location').preload('user');

    if (!tour) {
      throw new AppError(AppError.NOT_FOUND, 'Tour not found');
    }

    return tour;
  }

  static async store(user: User, data: any = {}) {
    const location = await Location.find(data.location_id);

    if (!location) {
      throw new AppError(AppError.NOT_FOUND, 'Location not found');
    }

    if (user.coworkUser.coworkAccountId !== location.coworkAccountId) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const clientUser = await User.findByOrFail('uuid', data.client_uuid);

    const trx = await Database.transaction();

    try {
      const newTour = await new Tour()
        .merge({
          ...Pick(data, Tour.fillable),
          locationId: data.location_id,
          userId: clientUser.id,
          status: ToursStatusEnum.APPROVED
        })
        .useTransaction(trx)
        .save();

      await trx.commit();
      await this.sendCalendarInvite(newTour);

      Event.emit('tour:new', { id: newTour.id });

      return newTour;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async update(id: number, user: User, data: any = {}) {
    await user.load('coworkUser');

    const tour = await Tour.query().where('id', id).preload('location').firstOrFail();

    if (tour.location.coworkAccountId !== user.coworkUser.coworkAccountId) {
      throw new AppError(AppError.NOT_FOUND, 'Location not found');
    }

    const trx = await Database.transaction();

    try {
      await tour.merge(Pick(data, Tour.fillable)).useTransaction(trx).save();

      await trx.commit();
      await this.sendCalendarInvite(tour);

      Event.emit('tour:update', { id: tour.id });
      return tour;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async delete(id: number, user: User) {
    await user.load('coworkUser');

    const tour = await Tour.query().where('id', id).preload('location').first();

    if (!tour) {
      throw new AppError(AppError.NOT_FOUND, 'Tour not found');
    }

    await tour.softDelete();
    await this.cancelCalendarInvite(tour.location.coworkAccountId, tour.id);

    Event.emit('tour:delete', { id: tour.id });
  }

  static async approve(id: number, user: User) {
    await user.load('coworkUser');

    const tour = await Tour.query().where('id', id).preload('location').firstOrFail();

    if (tour.location.coworkAccountId !== user.coworkUser.coworkAccountId) {
      throw new AppError(AppError.NOT_FOUND, 'Location not found');
    }

    if (tour.status === ToursStatusEnum.APPROVED) {
      throw new AppError(AppError.VALIDATION_FAIL, 'This tour has already been approved.');
    }

    //Check if there is another tour scheduled at the same time
    const checkTour = await Tour.query()
      .where('location_id', tour.locationId)
      .where('status', ToursStatusEnum.APPROVED)
      .where((query) => {
        query.where('date_start', '<=', tour.dateEnd.toSQL());
        query.andWhere('date_end', '>=', tour.dateStart.toSQL());
      })
      .first();

    if (checkTour) {
      throw new AppError(
        AppError.VALIDATION_FAIL,
        'There is already an approved tour at this time.'
      );
    }

    tour.status = ToursStatusEnum.APPROVED;
    await tour.save();

    await this.sendCalendarInvite(tour);
    Event.emit('tour:approve', { id: tour.id });

    return tour;
  }

  static async reject(id: number, user: User) {
    await user.load('coworkUser');

    const tour = await Tour.query().where('id', id).preload('location').firstOrFail();

    if (tour.location.coworkAccountId !== user.coworkUser.coworkAccountId) {
      throw new AppError(AppError.NOT_FOUND, 'Location not found');
    }

    tour.status = ToursStatusEnum.REJECTED;
    await tour.save();
    await this.cancelCalendarInvite(tour.location.coworkAccountId, tour.id);

    Event.emit('tour:reject', { id: tour.id });

    return tour;
  }

  private static async sendCalendarInvite(tour: Tour) {
    await tour.load('location');
    await tour.load('user');

    if (tour.location) {
      await tour.location.load('address');
    }

    if (tour.status === ToursStatusEnum.APPROVED) {
      await CalendarService.createOrUpdate(tour.location.coworkAccountId, {
        booking_type: EventBookingTypes.TOUR,
        resource_id: tour.id,
        summary: `Tour - ${tour.location.name}`,
        description: this.generateCalendarMessage(tour.location.name, tour.dateStart, tour.dateEnd),
        location_name: tour.location.name,
        location_address: tour.location.address?.fulltext || '',
        end_datetime: tour.dateEnd,
        start_datetime: tour.dateStart,
        is_full_day: false,
        client_name: tour.user.fullName,
        client_email: tour.user.email
      });
    }
  }

  private static async cancelCalendarInvite(coworkAccountId: number, resourceId: number) {
    await CalendarService.destroy(coworkAccountId, EventBookingTypes.TOUR, resourceId);
  }

  private static generateCalendarMessage(
    locationName: string,
    dateStart: DateTime,
    dateEnd: DateTime
  ) {
    let dateStartFormatted = dateStart.toFormat('MM/dd/yyyy hh:mm:ss');
    let dateEndFormatted = dateEnd.toFormat('MM/dd/yyyy hh:mm:ss');

    return `You have a confirmed tour at ${locationName} from ${dateStartFormatted} to ${dateEndFormatted}.`;
  }
}
