/**
 * SecretCipher — criptografia simétrica AES-256-GCM para secrets em DB.
 * Sprint B (HF-SPRINT-B-10).
 *
 * Uso típico:
 *  - Tokens OAuth (Google Calendar, Microsoft Exchange, Plaid)
 *  - Refresh tokens
 *  - Outros campos que NÃO devem trafegar em texto puro no banco
 *
 * Princípios:
 *  - AES-256-GCM (authenticated encryption — protege contra tampering)
 *  - IV (nonce) único de 12 bytes por valor (aleatório)
 *  - Tag de autenticação de 16 bytes
 *  - Formato armazenado: `enc:v1:<base64(iv|ciphertext|tag)>`
 *  - Prefixo `enc:v1:` permite distinguir valor cifrado de plaintext legado
 *  - `decrypt()` é tolerante: se receber plaintext (sem prefixo), devolve cru
 *    (migração gradual: lê valor velho, próximo save cifra)
 *
 * Chave: derivada de `APP_KEY` (já existente) via PBKDF2 com salt fixo
 * "workeaser-secret-cipher-v1". Garante que APP_KEY já robusto serve aqui.
 */
import { createCipheriv, createDecipheriv, pbkdf2Sync, randomBytes } from 'crypto';
import Env from '@ioc:Adonis/Core/Env';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // bytes (256 bits)
const IV_LENGTH = 12; // GCM standard
const TAG_LENGTH = 16;
const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_SALT = Buffer.from('workeaser-secret-cipher-v1', 'utf8');
const VERSION_PREFIX = 'enc:v1:';

let cachedKey: Buffer | null = null;

function deriveKey(): Buffer {
  if (cachedKey) return cachedKey;
  const appKey = Env.get('APP_KEY') as string | undefined;
  if (!appKey || appKey.length < 16) {
    throw new Error(
      'SecretCipher: APP_KEY ausente ou curto demais (mínimo 16 chars). Configure no .env.'
    );
  }
  cachedKey = pbkdf2Sync(appKey, PBKDF2_SALT, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha256');
  return cachedKey;
}

/** Criptografa uma string. Retorna string com prefixo `enc:v1:`. */
export function encrypt(plaintext: string | null | undefined): string | null {
  if (plaintext == null || plaintext === '') return null;
  // Já criptografado? Não re-cifrar (idempotente)
  if (typeof plaintext === 'string' && plaintext.startsWith(VERSION_PREFIX)) {
    return plaintext;
  }
  const key = deriveKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  const combined = Buffer.concat([iv, ciphertext, tag]).toString('base64');
  return `${VERSION_PREFIX}${combined}`;
}

/**
 * Descriptografa. Aceita:
 *  - String com prefixo `enc:v1:` → descriptografa
 *  - String sem prefixo → devolve como veio (compatibilidade com dados legados em plaintext)
 *  - null/undefined → null
 */
export function decrypt(value: string | null | undefined): string | null {
  if (value == null || value === '') return null;
  if (!value.startsWith(VERSION_PREFIX)) {
    // Valor legado em plaintext — devolver cru.
    // Próximo save vai cifrar via encrypt() no setter do model.
    return value;
  }
  try {
    const key = deriveKey();
    const combined = Buffer.from(value.slice(VERSION_PREFIX.length), 'base64');
    if (combined.length < IV_LENGTH + TAG_LENGTH + 1) {
      throw new Error('Payload cifrado muito curto');
    }
    const iv = combined.subarray(0, IV_LENGTH);
    const tag = combined.subarray(combined.length - TAG_LENGTH);
    const ciphertext = combined.subarray(IV_LENGTH, combined.length - TAG_LENGTH);
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return plain.toString('utf8');
  } catch (err) {
    // Falha de descriptografia (chave mudou, tampered, etc.) — não joga exceção
    // pra não derrubar caller. Loga e devolve null pra forçar re-autenticação.
    // (Em alta segurança: log alert + bloquear conta)
    // eslint-disable-next-line no-console
    console.error('[SecretCipher] decrypt failed:', err?.message || err);
    return null;
  }
}

/** Test helper: limpa cache de chave (usado em testes apenas) */
export function _resetForTest(): void {
  cachedKey = null;
}

export default { encrypt, decrypt };
