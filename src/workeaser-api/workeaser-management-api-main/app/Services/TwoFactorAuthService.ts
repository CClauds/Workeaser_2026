/**
 * TwoFactorAuthService — TOTP (RFC 6238) compatível com Google Authenticator, Authy, 1Password.
 * Sprint D (HF-SPRINT-D-05).
 *
 * Implementação self-contained (sem dependência externa):
 *  - Gera secret base32 random (160 bits) — cifrado em DB via SecretCipher
 *  - TOTP code = HMAC-SHA1(secret, floor(unixTime / 30)) → truncate → 6 dígitos
 *  - Janela de validação ±1 (aceita código atual + anterior + próximo)
 *  - Backup codes: 10 códigos alfanuméricos de 8 chars, cifrados em JSON
 *  - URI otpauth:// pra QR code no setup
 *
 * Fluxo de ativação:
 *  1. POST /api/me/2fa/setup → backend gera secret + URI + QR; user escaneia
 *  2. POST /api/me/2fa/verify { code } → backend valida; se OK, twoFactorEnabled=true
 *  3. POST /api/me/2fa/disable { code } → exige código pra desativar
 *  4. Login: se user.twoFactorEnabled, precisa enviar `two_factor_code` no payload
 */
import { createHmac, randomBytes } from 'crypto';
import { encrypt, decrypt } from 'App/Utils/SecretCipher';
import User from 'App/Models/User';
import AppError from 'App/Utils/AppError';
import { DateTime } from 'luxon';

const TOTP_STEP_SECONDS = 30;
const TOTP_DIGITS = 6;
const TOTP_WINDOW = 1; // ±1 step (30s)
const BACKUP_CODE_COUNT = 10;

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';
  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 0x1f];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 0x1f];
  }
  return output;
}

function base32Decode(s: string): Buffer {
  const clean = s.toUpperCase().replace(/=+$/, '').replace(/\s/g, '');
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (let i = 0; i < clean.length; i++) {
    const idx = BASE32_ALPHABET.indexOf(clean[i]);
    if (idx < 0) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

function generateTotp(secretBase32: string, step: number): string {
  const key = base32Decode(secretBase32);
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(step), 0);
  const hmac = createHmac('sha1', key).update(counter).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    (hmac[offset + 1] << 16) |
    (hmac[offset + 2] << 8) |
    hmac[offset + 3];
  const code = binary % 10 ** TOTP_DIGITS;
  return code.toString().padStart(TOTP_DIGITS, '0');
}

function generateBackupCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < BACKUP_CODE_COUNT; i++) {
    const raw = randomBytes(5).toString('hex').toUpperCase(); // 10 hex chars
    codes.push(`${raw.slice(0, 4)}-${raw.slice(4, 8)}`); // formato XXXX-XXXX
  }
  return codes;
}

class TwoFactorAuthServiceClass {
  /**
   * Inicia o setup: gera secret e devolve QR code URI.
   * NÃO ativa ainda — usuário precisa confirmar com `verify` digitando um código.
   */
  public async beginSetup(user: User, issuer = 'Workeaser'): Promise<{ secret: string; uri: string }> {
    const secretBytes = randomBytes(20); // 160 bits
    const secret = base32Encode(secretBytes);
    // Salva secret cifrado mas NÃO ativa ainda
    user.twoFactorSecretCipher = encrypt(secret);
    user.twoFactorEnabled = false;
    user.twoFactorEnabledAt = null;
    await user.save();

    const issuerEnc = encodeURIComponent(issuer);
    const labelEnc = encodeURIComponent(`${issuer}:${user.email}`);
    const uri = `otpauth://totp/${labelEnc}?secret=${secret}&issuer=${issuerEnc}&algorithm=SHA1&digits=${TOTP_DIGITS}&period=${TOTP_STEP_SECONDS}`;
    return { secret, uri };
  }

  /**
   * Confirma setup: valida código TOTP. Se OK, ativa 2FA e gera backup codes.
   */
  public async verifyAndEnable(user: User, code: string): Promise<{ backupCodes: string[] }> {
    if (!user.twoFactorSecretCipher) {
      throw new AppError(AppError.VALIDATION_FAIL, 'Setup não iniciado. Chame /2fa/setup primeiro.');
    }
    if (!this.verifyCode(user, code)) {
      throw new AppError(AppError.UNAUTHORIZED, 'Código inválido');
    }
    user.twoFactorEnabled = true;
    user.twoFactorEnabledAt = DateTime.now();
    const backupCodes = generateBackupCodes();
    user.twoFactorBackupCodesCipher = encrypt(JSON.stringify(backupCodes));
    await user.save();
    return { backupCodes };
  }

  /** Desativa 2FA. Exige código válido pra confirmar identidade. */
  public async disable(user: User, code: string): Promise<void> {
    if (!user.twoFactorEnabled) return;
    if (!this.verifyCode(user, code) && !this.tryBackupCode(user, code)) {
      throw new AppError(AppError.UNAUTHORIZED, 'Código inválido');
    }
    user.twoFactorEnabled = false;
    user.twoFactorSecretCipher = null;
    user.twoFactorBackupCodesCipher = null;
    user.twoFactorEnabledAt = null;
    await user.save();
  }

  /** Verifica código TOTP — aceita janela ±1 step (±30s). */
  public verifyCode(user: User, code: string): boolean {
    if (!user.twoFactorSecretCipher) return false;
    const secret = decrypt(user.twoFactorSecretCipher);
    if (!secret) return false;

    const cleanCode = String(code).replace(/\s/g, '');
    if (!/^\d{6}$/.test(cleanCode)) return false;

    const now = Math.floor(Date.now() / 1000);
    const currentStep = Math.floor(now / TOTP_STEP_SECONDS);
    for (let i = -TOTP_WINDOW; i <= TOTP_WINDOW; i++) {
      const generated = generateTotp(secret, currentStep + i);
      if (generated === cleanCode) return true;
    }
    return false;
  }

  /** Valida e consome um backup code. Único uso por código. */
  public async tryBackupCode(user: User, code: string): Promise<boolean> {
    if (!user.twoFactorBackupCodesCipher) return false;
    const raw = decrypt(user.twoFactorBackupCodesCipher);
    if (!raw) return false;
    let codes: string[] = [];
    try {
      codes = JSON.parse(raw);
    } catch {
      return false;
    }
    const normalized = String(code).replace(/\s/g, '').toUpperCase();
    const idx = codes.findIndex((c) => c.toUpperCase() === normalized);
    if (idx === -1) return false;
    // Consome
    codes.splice(idx, 1);
    user.twoFactorBackupCodesCipher = encrypt(JSON.stringify(codes));
    await user.save();
    return true;
  }
}

export const TwoFactorAuthService = new TwoFactorAuthServiceClass();
export default TwoFactorAuthService;
