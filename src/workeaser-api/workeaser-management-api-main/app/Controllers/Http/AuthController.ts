import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { responseWithError, responseWithSuccess } from 'App/Utils/ResponseApi';
import AppError from 'App/Utils/AppError';

import UserService from 'App/Services/UserService';
// HF-SPRINT-D-07: 2FA TOTP integration
import TwoFactorAuthService from 'App/Services/TwoFactorAuthService';
// HF-SPRINT-E-04: audit trail expandido
import AuditTrailService from 'App/Services/AuditTrailService';
import User from 'App/Models/User';
import EmailConfirmationValidator from 'App/Validators/Auth/EmailConfirmationValidator';
import LoginUserValidator from 'App/Validators/Auth/LoginUserValidator';
import LostPasswordConfirmationValidator from 'App/Validators/Auth/LostPasswordConfirmationValidator';
import LostPasswordValidator from 'App/Validators/Auth/LostPasswordValidator';
import ResendEmailConfirmationValidator from 'App/Validators/Auth/ResendEmailConfirmationValidator';
import SignupUserValidator from 'App/Validators/SignupUserValidator';

export default class AuthController {
  public async login(ctx: HttpContextContract) {
    const { request, auth, response } = ctx;
    const payload = await request.validate(LoginUserValidator);

    // HF-SPRINT-D-07: pré-check 2FA ANTES de criar token completo.
    // Se user tem 2FA ativo, exige `two_factor_code` no payload (TOTP 6 dígitos OU backup code).
    // Se omitido: devolve 401 com flag `two_factor_required=true` pro frontend pedir o código.
    const candidate = await User.findBy('email', (payload as any).email);
    if (candidate && candidate.twoFactorEnabled) {
      const twoFactorCode = String(request.input('two_factor_code', '')).trim();
      if (!twoFactorCode) {
        return response.status(401).json({
          status: 'ERROR',
          error: {
            code: 'TWO_FACTOR_REQUIRED',
            message: 'Conta protegida por 2FA. Informe o código de 6 dígitos do app autenticador (campo: two_factor_code).',
          },
          two_factor_required: true,
        });
      }
      const ok =
        TwoFactorAuthService.verifyCode(candidate, twoFactorCode) ||
        (await TwoFactorAuthService.tryBackupCode(candidate, twoFactorCode));
      if (!ok) {
        void AuditTrailService.loginFailure(ctx, (payload as any).email, 'invalid_2fa_code');
        return response.status(401).json({
          status: 'ERROR',
          error: { code: 'TWO_FACTOR_INVALID', message: 'Código 2FA inválido' },
        });
      }
      // OK: caiu fora do throw, segue pro login normal
    }

    try {
      const userToken = await UserService.login(auth, payload);

      // HF-SPRINT-E-04: audit success
      void AuditTrailService.loginSuccess(ctx);
      void AppError; // silencia warning import potencialmente não-usado
      return responseWithSuccess(response, userToken);
    } catch (err: any) {
      void AuditTrailService.loginFailure(ctx, (payload as any).email, err?.message || 'unknown');
      throw err;
    }
  }

  public async logout({ auth, response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      await UserService.logout(auth);

      return responseWithSuccess(response, { revoked: true });
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  public async emailConfirmation({ request, response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const payload = await request.validate(EmailConfirmationValidator);
      await UserService.confirmEmailToken(payload);

      return responseWithSuccess(response);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  public async resendEmailConfirmation({ request, response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const payload = await request.validate(ResendEmailConfirmationValidator);
      await UserService.resendEmailConfirmation(payload);

      return responseWithSuccess(response, 'The email with the activation link has been sent');
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  public async lostPassword({ request, response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const payload = await request.validate(LostPasswordValidator);
      await UserService.lostPassword(payload);

      return responseWithSuccess(response);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  public async lostPasswordConfirmation({ request, response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const payload = await request.validate(LostPasswordConfirmationValidator);
      await UserService.lostPasswordConfirmation(payload);

      return responseWithSuccess(response);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  public async store({ request, response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const payload = await request.validate(SignupUserValidator);
      const user = await UserService.store(payload);

      return responseWithSuccess(response, {
        email: user.email,
        email_confirmed: user.emailConfirmed,
        message:
          'Account created successfully. A confirmation email has been sent — please verify your email before logging in.'
      });
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }
}
