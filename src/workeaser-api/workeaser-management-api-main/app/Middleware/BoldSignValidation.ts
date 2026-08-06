import Env from '@ioc:Adonis/Core/Env';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import AppError from 'App/Utils/AppError';
import { isFromBoldSign } from 'App/Utils/BoldSign';

export default class BoldSignValidation {
  public async handle({ request, response }: HttpContextContract, next: () => Promise<void>) {
    const eventType = request.header('x-boldsign-event');

    if (eventType === 'Verification') {
      return response.status(200);
    }

    const signature = request.header('x-boldsign-signature');
    const payload = JSON.stringify(request.body());
    const SECRET_KEY = Env.get('BOLD_SIGN_WEBHOOK_SECRET_KEY');
    let isValid;
    try {
      isValid = isFromBoldSign(signature, payload, SECRET_KEY);
    } catch (e) {
      console.error(e);

      throw new AppError(AppError.BAD_REQUEST, 'Unable to validate request');
    }

    if (!isValid) {
      throw new AppError(AppError.FORBIDDEN, 'Unable to validate request');
    }

    await next();
  }
}
