import Event from 'App/Models/Event';
import GoogleCalendar from 'App/Integrations/calendar/GoogleCalendar';
import ExchangeCalendar from 'App/Integrations/calendar/ExchangeCalendar';
import CalendarIntegration from 'App/Models/CalendarIntegration';
import { CalendarData } from 'App/Integrations/calendar/Calendar.interface';
import { IntegrationServiceEnum } from 'Contracts/enums';

interface Events {
  calendarIntegrationId: number;
  eventId: string;
  bookingType: string;
  resourceId: number;
}

export default class CalendarService {
  static async createOrUpdate(coworkAccountId: number, data: CalendarData) {
    const events = await Event.query()
      .preload('calendarIntegration')
      .where('booking_type', data.booking_type)
      .where('resource_id', data.resource_id);

    if (events.length) {
      for (const event of events) {
        if (event.calendarIntegration.service === IntegrationServiceEnum.GOOGLE) {
          const google = new GoogleCalendar();

          const token = await google.authorization({
            token: event.calendarIntegration.token,
            refreshToken: event.calendarIntegration.refreshToken,
            coworkAccountId: coworkAccountId
          });

          await google.update(token, event.eventId, data);
        }

        if (event.calendarIntegration.service === IntegrationServiceEnum.EXCHANGE) {
          const exchange = new ExchangeCalendar();

          const token = await exchange.authorization({
            token: event.calendarIntegration.token,
            refreshToken: event.calendarIntegration.refreshToken,
            coworkAccountId: coworkAccountId
          });

          await exchange.update(token, event.eventId, data);
        }
      }
    } else {
      const integrations = await CalendarIntegration.query()
        .where('cowork_account_id', coworkAccountId)
        .whereNull('deleted_at');

      let events: Events[] = [];

      for (let target of integrations) {
        if (target.service === IntegrationServiceEnum.GOOGLE) {
          const google = new GoogleCalendar();

          const token = await google.authorization({
            token: target.token,
            refreshToken: target.refreshToken,
            coworkAccountId: coworkAccountId
          });

          const googleEventId = await google.insert(token, data);
          events.push({
            calendarIntegrationId: target.id,
            eventId: googleEventId,
            bookingType: data.booking_type,
            resourceId: data.resource_id
          });
        }

        if (target.service === IntegrationServiceEnum.EXCHANGE) {
          const exchange = new ExchangeCalendar();

          const token = await exchange.authorization({
            token: target.token,
            refreshToken: target.refreshToken,
            coworkAccountId: coworkAccountId
          });

          const exchangeEventID = await exchange.insert(token, data);
          events.push({
            calendarIntegrationId: target.id,
            eventId: exchangeEventID,
            bookingType: data.booking_type,
            resourceId: data.resource_id
          });
        }
      }

      await Event.createMany(events);
    }
  }

  static async destroy(coworkAccountId: number, bookingType: string, resourceId: number) {
    const events = await Event.query()
      .preload('calendarIntegration')
      .where('booking_type', bookingType)
      .where('resource_id', resourceId);

    if (!events.length) {
      return;
    }

    for (const event of events) {
      if (event.calendarIntegration.service === IntegrationServiceEnum.GOOGLE) {
        const google = new GoogleCalendar();

        const token = await google.authorization({
          token: event.calendarIntegration.token,
          refreshToken: event.calendarIntegration.refreshToken,
          coworkAccountId: coworkAccountId
        });

        await google.delete(token, event.eventId);
      }

      if (event.calendarIntegration.service === IntegrationServiceEnum.EXCHANGE) {
        const exchange = new ExchangeCalendar();

        const token = await exchange.authorization({
          token: event.calendarIntegration.token,
          refreshToken: event.calendarIntegration.refreshToken,
          coworkAccountId: coworkAccountId
        });

        await exchange.delete(token, event.eventId);
      }

      await event.delete();
    }
  }
}
