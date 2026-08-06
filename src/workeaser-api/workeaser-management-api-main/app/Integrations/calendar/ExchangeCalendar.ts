import 'isomorphic-fetch';
import Env from '@ioc:Adonis/Core/Env';
import AppError from 'App/Utils/AppError';
import CalendarIntegration from 'App/Models/CalendarIntegration';
import { Client } from '@microsoft/microsoft-graph-client';
import { DateTime } from 'luxon';
import { ConfidentialClientApplication } from '@azure/msal-node';
import { Calendar, CalendarData, Credentials } from './Calendar.interface';

const SCOPES = ['user.read', 'calendars.readwrite', 'offline_access'];

export default class ExchangeCalendar implements Calendar {
  async insert(token: string, params: CalendarData): Promise<any> {
    let event: { [k: string]: any } = {
      Subject: params.summary,
      Start: {
        TimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      End: {
        TimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      Location: {
        DisplayName: params.location_name,
        Address: {
          Street: params.location_address
        }
      },
      Attendees: [
        {
          emailAddress: {
            address: params.client_email,
            name: params.client_name
          },
          type: 'required'
        }
      ]
    };

    if (params.is_full_day) {
      const startDay = params.start_datetime.toFormat('yyyy-MM-dd');
      const endDay = params.end_datetime.toFormat('yyyy-MM-dd');

      event.Start.DateTime = `${startDay}T00:00:00`;
      event.End.DateTime = `${endDay}T00:00:00`;
    } else {
      event.Start.DateTime = params.start_datetime.toISO();
      event.End.DateTime = params.end_datetime.toISO();
    }

    const client = Client.init({
      authProvider: (done) => {
        done(null, token);
      }
    });

    const eventId = await client.api('me/events').post(event);
    return eventId.id;
  }

  async update(token: string, eventId: string, params: CalendarData): Promise<any> {
    let event: { [k: string]: any } = {
      Subject: params.summary,
      Start: {
        TimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      End: {
        TimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      Location: {
        DisplayName: 'Default',
        Address: {
          Street: params.location_address
        }
      },
      Attendees: [
        {
          emailAddress: {
            address: params.client_email,
            name: params.client_name
          },
          type: 'required'
        }
      ]
    };

    if (params.is_full_day) {
      const startDay = params.start_datetime.toFormat('yyyy-MM-dd');
      const endDay = params.end_datetime.toFormat('yyyy-MM-dd');

      event.Start.DateTime = `${startDay}T00:00:00`;
      event.End.DateTime = `${endDay}T00:00:00`;
    } else {
      event.Start.dateTime = params.start_datetime;
      event.End.dateTime = params.end_datetime;
    }

    const client = Client.init({
      authProvider: (done) => {
        done(null, token);
      }
    });

    await client.api(`me/events/${eventId}`).update(event);
  }

  async delete(token: string, eventId: string): Promise<any> {
    const client = Client.init({
      authProvider: (done) => {
        done(null, token);
      }
    });

    await client.api(`me/events/${eventId}`).delete();
  }

  async authorization(credentials: Credentials): Promise<string> {
    let token = credentials.token;

    const userIntegration = await CalendarIntegration.query()
      .where('service', 'EXCHANGE')
      .where('cowork_account_id', credentials.coworkAccountId)
      .whereNull('deleted_at')
      .first();

    if (!userIntegration) {
      throw new AppError(AppError.NOT_FOUND, 'Calendar Integration not found');
    }

    if (credentials.refreshToken) {
      if (userIntegration.expiredAt) {
        const expiresToken = userIntegration.expiredAt;
        const currentDate = DateTime.now();

        if (currentDate < expiresToken) {
          return token;
        }
      }

      const client = new ConfidentialClientApplication({
        auth: {
          clientId: Env.get('EXCHANGE_CLIENT_ID'),
          authority: Env.get('EXCHANGE_AUTHORITY'),
          clientSecret: Env.get('EXCHANGE_CLIENT_SECRET')
        }
      });

      const resource = await client.acquireTokenByRefreshToken({
        refreshToken: credentials.refreshToken,
        scopes: SCOPES
      });

      if (resource) {
        await client.acquireTokenOnBehalfOf({
          oboAssertion: resource.idToken,
          scopes: SCOPES
        });

        const tokenCache = client.getTokenCache().serialize();

        const accessToken: any = Object.values(JSON.parse(tokenCache).AccessToken)[0];
        const refreshToken: any = Object.values(JSON.parse(tokenCache).RefreshToken)[0];
        const expires: any = Object.values(JSON.parse(tokenCache).AccessToken)[0];

        const expiresAt: any = DateTime.fromMillis(Number(expires.expires_on) * 1000);

        userIntegration.token = accessToken.secret;
        userIntegration.refreshToken = refreshToken.secret;
        userIntegration.expiredAt = expiresAt;
        await userIntegration.save();

        return accessToken.secret;
      }
    } else {
      const createdTokenDate = userIntegration.createdAt;
      const createdTokenDateToISO = createdTokenDate.plus({ minutes: 58 });
      const currentDateToISO = DateTime.now();

      if (currentDateToISO > createdTokenDateToISO) {
        throw new AppError(AppError.VALIDATION_FAIL, 'Exchange Access token invalid');
      }
    }
    return token;
  }
}
