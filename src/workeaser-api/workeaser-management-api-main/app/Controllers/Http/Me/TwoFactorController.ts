/**
 * TwoFactorController — endpoints de gestão 2FA TOTP.
 * Sprint D (HF-SPRINT-D-06).
 *
 * Endpoints:
 *  GET    /api/me/2fa            → status atual (enabled? when?)
 *  POST   /api/me/2fa/setup      → gera secret + URI pra QR; ainda NÃO ativa
 *  POST   /api/me/2fa/verify     → confirma com código; ativa + devolve backup codes
 *  POST   /api/me/2fa/disable    → desativa (exige código)
 *
 * Todos os endpoints requerem auth.
 */
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import AppError from 'App/Utils/AppError';
import { responseWithError, responseWithSuccess } from 'App/Utils/ResponseApi';
import TwoFactorAuthService from 'App/Services/TwoFactorAuthService';
// HF-SPRINT-E-04: audit trail
import AuditTrailService from 'App/Services/AuditTrailService';

export default class TwoFactorController {
  public async status({ auth, response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;
      if (!user) throw new AppError(AppError.UNAUTHORIZED, 'Não autenticado');
      return responseWithSuccess(response, {
        enabled: user.twoFactorEnabled || false,
        enabled_at: user.twoFactorEnabledAt?.toISO() || null,
        has_pending_setup: !!user.twoFactorSecretCipher && !user.twoFactorEnabled,
      });
    } catch (err) {
      return responseWithError(response, err);
    }
  }

  public async setup({ auth, response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;
      if (!user) throw new AppError(AppError.UNAUTHORIZED, 'Não autenticado');
      if (user.twoFactorEnabled) {
        throw new AppError(AppError.VALIDATION_FAIL, '2FA já está ativo. Desative antes de re-configurar.');
      }
      const { secret, uri } = await TwoFactorAuthService.beginSetup(user);
      return responseWithSuccess(response, {
        secret, // base32 — usuário pode digitar manualmente se QR não funcionar
        otpauth_uri: uri, // frontend renderiza QR code disso
        message: 'Escaneie o QR code no Google Authenticator/Authy. Depois confirme com /api/me/2fa/verify enviando o código de 6 dígitos.',
      });
    } catch (err) {
      return responseWithError(response, err);
    }
  }

  public async verify(ctx: HttpContextContract) {
    const { auth, request, response } = ctx;
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;
      if (!user) throw new AppError(AppError.UNAUTHORIZED, 'Não autenticado');
      const code = request.input('code');
      if (!code || typeof code !== 'string') {
        throw new AppError(AppError.VALIDATION_FAIL, 'code obrigatório (6 dígitos)');
      }
      const result = await TwoFactorAuthService.verifyAndEnable(user, code);
      // HF-SPRINT-E-04: audit
      void AuditTrailService.twoFactorEnabled(ctx);
      return responseWithSuccess(response, {
        enabled: true,
        backup_codes: result.backupCodes,
        message:
          '2FA ativado. GUARDE OS BACKUP CODES em local seguro. Cada um pode ser usado 1 única vez se você perder acesso ao app autenticador.',
      });
    } catch (err) {
      return responseWithError(response, err);
    }
  }

  public async disable(ctx: HttpContextContract) {
    const { auth, request, response } = ctx;
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;
      if (!user) throw new AppError(AppError.UNAUTHORIZED, 'Não autenticado');
      const code = request.input('code');
      if (!code || typeof code !== 'string') {
        throw new AppError(AppError.VALIDATION_FAIL, 'code obrigatório (6 dígitos ou backup code)');
      }
      await TwoFactorAuthService.disable(user, code);
      void AuditTrailService.twoFactorDisabled(ctx);
      return responseWithSuccess(response, {
        enabled: false,
        message: '2FA desativado.',
      });
    } catch (err) {
      return responseWithError(response, err);
    }
  }
}
