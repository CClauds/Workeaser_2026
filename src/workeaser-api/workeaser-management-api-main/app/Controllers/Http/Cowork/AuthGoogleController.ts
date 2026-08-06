import Env from '@ioc:Adonis/Core/Env';
import User from 'App/Models/User';
import AppError from 'App/Utils/AppError';
import ApplicationUrls from 'App/Utils/ApplicationUrls';
import CalendarIntegration from 'App/Models/CalendarIntegration';
import { google } from 'googleapis';
import { DateTime } from 'luxon';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { IntegrationServiceEnum } from 'Contracts/enums';
import { responseWithError, responseWithSuccess } from 'App/Utils/ResponseApi';

export default class AuthGoogleController {
  public async redirect({ response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const oauth2Client = new google.auth.OAuth2(
        Env.get('GOOGLE_CLIENT_ID'),
        Env.get('GOOGLE_CLIENT_SECRET'),
        Env.get('GOOGLE_URI_REDIRECT')
      );

      const scopes = [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/userinfo.email'
      ];

      const state = {
        uid: user.id
      };

      const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        state: JSON.stringify(state)
      });

      return responseWithSuccess(response, { url });
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  public async callback({ response, request }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const code = request.qs().code;
      const state = JSON.parse(request.qs().state);

      const oauth2Client = new google.auth.OAuth2(
        Env.get('GOOGLE_CLIENT_ID'),
        Env.get('GOOGLE_CLIENT_SECRET'),
        Env.get('GOOGLE_URI_REDIRECT')
      );

      if (!state || !state.uid) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const { tokens } = await oauth2Client.getToken(code);

      const expiresFormatted: any = DateTime.fromMillis(Number(tokens.expiry_date));

      const user = await User.findByOrFail('id', state.uid);
      await user.load('coworkUser');

      const searchIntegration = await CalendarIntegration.query()
        .where('cowork_account_id', user.coworkUser.coworkAccountId)
        .where('service', IntegrationServiceEnum.GOOGLE)
        .first();

      if (searchIntegration) {
        searchIntegration.token = String(tokens.access_token);
        searchIntegration.refreshToken = String(tokens.refresh_token);
        searchIntegration.expiredAt = expiresFormatted;
      } else {
        await CalendarIntegration.create({
          coworkAccountId: user.coworkUser.coworkAccountId,
          service: IntegrationServiceEnum.GOOGLE,
          token: String(tokens.access_token),
          refreshToken: String(tokens.refresh_token),
          expiredAt: expiresFormatted
        });
      }

      return responseWithSuccess(
        response,
        response.redirect(ApplicationUrls.SETTING.CALENDAR_INTEGRATION)
      );
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }
}
