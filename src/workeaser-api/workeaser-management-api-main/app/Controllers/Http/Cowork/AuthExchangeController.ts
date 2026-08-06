import Env from '@ioc:Adonis/Core/Env';
import User from 'App/Models/User';
import AppError from 'App/Utils/AppError';
import ApplicationUrls from 'App/Utils/ApplicationUrls';
import CalendarIntegration from 'App/Models/CalendarIntegration';
import { DateTime } from 'luxon';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { IntegrationServiceEnum } from 'Contracts/enums';
import { ConfidentialClientApplication } from '@azure/msal-node';
import { responseWithError, responseWithSuccess } from 'App/Utils/ResponseApi';

const SCOPES = ['user.read', 'calendars.readwrite', 'offline_access'];

export default class AuthExchangeController {
  public async redirect({ response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const client = new ConfidentialClientApplication({
        auth: {
          clientId: Env.get('EXCHANGE_CLIENT_ID'),
          authority: Env.get('EXCHANGE_AUTHORITY'),
          clientSecret: Env.get('EXCHANGE_CLIENT_SECRET')
        }
      });

      const state = {
        uid: user.id
      };

      const url = await client.getAuthCodeUrl({
        scopes: SCOPES,
        redirectUri: Env.get('EXCHANGE_REDIRECT_URI'),
        state: JSON.stringify(state)
      });

      return responseWithSuccess(response, { url });
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  public async callback({ request, response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const state = JSON.parse(request.qs().state);

      if (!state || !state.uid) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const tokenRequest = {
        code: request.qs().code,
        scopes: SCOPES,
        redirectUri: Env.get('EXCHANGE_REDIRECT_URI')
      };

      const client = new ConfidentialClientApplication({
        auth: {
          clientId: Env.get('EXCHANGE_CLIENT_ID'),
          authority: Env.get('EXCHANGE_AUTHORITY'),
          clientSecret: Env.get('EXCHANGE_CLIENT_SECRET')
        }
      });

      await client.acquireTokenByCode(tokenRequest);
      const token = client.getTokenCache().serialize();

      const accessToken: any = Object.values(JSON.parse(token).AccessToken)[0];
      const refreshToken: any = Object.values(JSON.parse(token).RefreshToken)[0];
      const expires: any = Object.values(JSON.parse(token).AccessToken)[0];

      const expiresAt: any = DateTime.fromMillis(Number(expires.expires_on) * 1000);

      const user = await User.findByOrFail('id', state.uid);
      await user.load('coworkUser');

      const searchIntegration = await CalendarIntegration.query()
        .where('cowork_account_id', user.coworkUser.coworkAccountId)
        .where('service', IntegrationServiceEnum.EXCHANGE)
        .first();

      if (searchIntegration) {
        searchIntegration.token = accessToken.secret;
        searchIntegration.refreshToken = refreshToken.secret;
        searchIntegration.expiredAt = expiresAt;
      } else {
        await CalendarIntegration.create({
          coworkAccountId: user.coworkUser.coworkAccountId,
          service: IntegrationServiceEnum.EXCHANGE,
          token: accessToken.secret,
          refreshToken: refreshToken.secret,
          expiredAt: expiresAt
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
