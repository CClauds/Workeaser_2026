import Env from '@ioc:Adonis/Core/Env';
import AppError from 'App/Utils/AppError';
import CalendarIntegration from 'App/Models/CalendarIntegration';
import { google } from 'googleapis';
import { DateTime } from 'luxon';
import { Calendar, CalendarData, Credentials } from './Calendar.interface';

export default class GoogleCalendar implements Calendar {
  async insert(token: string, params: CalendarData): Promise<any> {
    const oauthClient = new google.auth.OAuth2(
      Env.get('GOOGLE_CLIENT_ID'),
      Env.get('GOOGLE_CLIENT_SECRET'),
      Env.get('GOOGLE_URI_REDIRECT')
    );

    oauthClient.setCredentials({
      access_token: token
    });

    const calendar = google.calendar({ version: 'v3', auth: oauthClient });

    let event: { [k: string]: any } = {
      calendarId: 'primary',
      requestBody: {
        start: {},
        end: {},
        summary: params.summary,
        description: params.description,
        location: params.location_address
      },
      attendees: [{ email: params.client_email }]
    };

    if (params.is_full_day) {
      event.requestBody.start.date = params.start_datetime.toFormat('yyyy-MM-dd');
      event.requestBody.end.date = params.end_datetime.toFormat('yyyy-MM-dd');
    } else {
      event.requestBody.start.dateTime = params.start_datetime;
      event.requestBody.end.dateTime = params.end_datetime;
    }

    const eventId = await calendar.events.insert(event);
    return eventId.data.id;
  }

  async update(token: string, eventId: string, params: CalendarData): Promise<any> {
    const oauthClient = new google.auth.OAuth2(
      Env.get('GOOGLE_CLIENT_ID'),
      Env.get('GOOGLE_CLIENT_SECRET'),
      Env.get('GOOGLE_URI_REDIRECT')
    );

    oauthClient.setCredentials({
      access_token: token
    });

    const calendar = google.calendar({ version: 'v3', auth: oauthClient });

    let event: { [k: string]: any } = {
      calendarId: 'primary',
      eventId,
      requestBody: {
        start: {},
        end: {},
        summary: params.summary,
        description: params.description,
        location: params.location_address
      }
    };

    if (params.is_full_day) {
      event.requestBody.start.date = params.start_datetime.toFormat('yyyy-MM-dd');
      event.requestBody.end.date = params.end_datetime.toFormat('yyyy-MM-dd');
    } else {
      event.requestBody.start.dateTime = params.start_datetime;
      event.requestBody.end.dateTime = params.end_datetime;
    }

    await calendar.events.update(event);
  }

  async delete(token: string, eventId: string): Promise<any> {
    const oauthClient = new google.auth.OAuth2(
      Env.get('GOOGLE_CLIENT_ID'),
      Env.get('GOOGLE_CLIENT_SECRET'),
      Env.get('GOOGLE_URI_REDIRECT')
    );

    oauthClient.setCredentials({
      access_token: token
    });

    const calendar = google.calendar({ version: 'v3', auth: oauthClient });

    await calendar.events.delete({
      calendarId: 'primary',
      eventId
    });
  }

  async authorization(credentials: Credentials): Promise<string> {
    let token: any = credentials.token;

    const userIntegration = await CalendarIntegration.query()
      .where('service', 'GOOGLE')
      .where('cowork_account_id', credentials.coworkAccountId)
      .whereNull('deleted_at')
      .first();

    if (!userIntegration) {
      throw new AppError(AppError.NOT_FOUND, 'Calendar Integration not found');
    }

    const googleClient = google.auth;
    const oauthClient = new googleClient.OAuth2(
      Env.get('GOOGLE_CLIENT_ID'),
      Env.get('GOOGLE_CLIENT_SECRET'),
      Env.get('GOOGLE_URI_REDIRECT')
    );

    if (credentials.refreshToken) {
      if (userIntegration.expiredAt) {
        const expiresToken = userIntegration.expiredAt;
        const currentDate = DateTime.now();

        if (currentDate < expiresToken) {
          return token;
        }
      }

      oauthClient.credentials.refresh_token = credentials.refreshToken;
      const resource = await oauthClient.getAccessToken();

      const accessToken = resource.token;
      const expiredAt = resource.res?.data.expiry_date;
      const expiredAtFormatted = DateTime.fromMillis(Number(expiredAt));

      userIntegration.token = accessToken;
      userIntegration.expiredAt = expiredAtFormatted;
      await userIntegration.save();

      return accessToken!;
    } else {
      oauthClient
        .getTokenInfo(token)
        .then((response) => response)
        .catch((error) => {
          if (error) {
            throw new AppError(AppError.VALIDATION_FAIL, 'Google Access token invalid');
          }
        });
    }
    return token;
  }
}
