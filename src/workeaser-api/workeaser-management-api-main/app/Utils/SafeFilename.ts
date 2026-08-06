/**
 * Helpers para sanitizar nomes de arquivo e paths derivados de input do usuario.
 *
 * Mitigacao primaria para `@adonisjs/bodyparser` path traversal (Lote 5b).
 * Tambem aplicavel a qualquer endpoint que aceite path como parametro de rota
 * (vide PhotosController.show, DocumentsController.show, etc).
 *
 * Estrategia:
 * - Bloqueia segmentos `..`, paths absolutos, barras, backslashes, null byte,
 *   caracteres de controle e nomes vazios.
 * - Limita tamanho final.
 * - Preserva extensao quando ela esta numa allowlist.
 * - Quando o nome de entrada nao e seguro, devolve `null` (caller decide o que
 *   fazer) OU usa o fallback gerado por `safeRandomName()`.
 */
import { extname as pathExtname, basename as pathBasename } from 'path';
import { randomUUID } from 'crypto';

const MAX_FILENAME_LENGTH = 120;
const SAFE_NAME_RE = /^[A-Za-z0-9._-]+$/;

/** Allowlist mais restritiva — usar para uploads de usuario final. */
export const ALLOWED_EXTENSIONS_DEFAULT = [
  'pdf',
  'jpg',
  'jpeg',
  'png',
  'gif',
  'webp',
  'svg',
  'csv',
  'xls',
  'xlsx',
  'docx',
  'doc',
] as const;

export interface SanitizeOptions {
  allowedExtensions?: readonly string[];
  maxLength?: number;
}

/**
 * Retorna o nome sanitizado ou `null` se nada sobrar de seguro.
 *
 * Use no momento em que voce esta prestes a chamar `file.move({ name })` ou
 * `Drive.put(path, ...)`. Combine com `safeRandomName()` se quiser sempre
 * gerar um nome controlado pelo backend.
 */
export function sanitizeFilename(
  input: string | undefined | null,
  opts: SanitizeOptions = {}
): string | null {
  if (input == null) return null;

  const allowed = opts.allowedExtensions ?? ALLOWED_EXTENSIONS_DEFAULT;
  const maxLen = opts.maxLength ?? MAX_FILENAME_LENGTH;

  // Strip control characters (0x00-0x1F, 0x7F) e null bytes.
  // eslint-disable-next-line no-control-regex
  let s = String(input).replace(/[\x00-\x1f\x7f]/g, '');

  // Resolver apenas o basename — descarta qualquer prefixo de path.
  s = pathBasename(s);

  // Remover barras / backslashes restantes (alguns OSes nao tratam).
  s = s.replace(/[\\/]/g, '');

  // Rejeitar segmentos puramente de path traversal apos basename.
  if (s === '' || s === '.' || s === '..') return null;

  // Bloquear nomes que mantem `..` como infixo malicioso.
  if (s.includes('..')) return null;

  // Trim final
  s = s.trim();
  if (s.length === 0) return null;

  // Separar extensao
  const ext = pathExtname(s).replace(/^\./, '').toLowerCase();
  const stem = ext ? s.slice(0, -(ext.length + 1)) : s;

  // Validar extensao se houver allowlist
  if (allowed.length > 0 && ext && !allowed.includes(ext)) {
    return null;
  }

  // Validar stem (so caracteres seguros)
  if (!SAFE_NAME_RE.test(stem || 'x')) {
    return null;
  }

  // Recompose com limite de tamanho
  const recomposed = ext ? `${stem}.${ext}` : stem;
  if (recomposed.length > maxLen) {
    return recomposed.slice(0, maxLen);
  }
  return recomposed;
}

/**
 * Sempre gera um nome seguro controlado pelo backend.
 * Preserva extensao se for valida. Caso contrario, usa `.bin`.
 */
export function safeRandomName(
  originalExt: string | undefined | null,
  allowed: readonly string[] = ALLOWED_EXTENSIONS_DEFAULT
): string {
  const ext = (originalExt || '').toLowerCase().replace(/^\./, '');
  const safeExt = allowed.includes(ext) ? ext : 'bin';
  return `${randomUUID()}.${safeExt}`;
}

/**
 * Sanitiza um path relativo (ex: 'subdir/file.png') vindo de `request.param('*').join('/')`.
 *
 * Cada segmento e sanitizado individualmente. Retorna null se qualquer segmento
 * for invalido — o caller deve responder 400.
 */
export function sanitizeRelativePath(
  input: string | undefined | null,
  opts: SanitizeOptions = {}
): string | null {
  if (input == null) return null;

  // Strip null/control bytes
  // eslint-disable-next-line no-control-regex
  let s = String(input).replace(/[\x00-\x1f\x7f]/g, '');

  // Path absoluto? rejeitar
  if (/^[/\\]/.test(s) || /^[A-Za-z]:[/\\]/.test(s)) return null;

  // Qualquer segmento `..`? rejeitar
  const segments = s.split(/[/\\]/).filter(Boolean);
  if (segments.length === 0) return null;
  if (segments.some((seg) => seg === '..' || seg.includes('..'))) return null;

  // Sanitizar cada segmento
  const cleaned: string[] = [];
  for (const seg of segments) {
    const c = sanitizeFilename(seg, opts);
    if (c == null) return null;
    cleaned.push(c);
  }

  return cleaned.join('/');
}
