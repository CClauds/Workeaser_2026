/**
 * WebhookReplayProtection — proteção contra replay attacks em webhooks.
 * Sprint G (HF-SPRINT-G-02).
 *
 * O risco:
 *  - Atacante captura 1 webhook legítimo (sniff, MITM histórico, logs vazados)
 *  - Reenvia EXATAMENTE o mesmo payload + signature pra causar duplicação
 *  - Ex: invoice.paid → marca invoice paga sem pagamento real
 *  - Signature HMAC bate (é o mesmo payload), mas comportamento é fraudulento
 *
 * Defesa em camadas:
 *  1. Timestamp window: rejeita webhooks com timestamp > 5 min do clock atual
 *     - Limita janela de replay útil
 *     - Stripe já envia `Stripe-Signature` com `t=` timestamp; Meta envia em header X-Workeaser-Replay-Skew
 *  2. Nonce cache (in-memory): registra IDs de eventos já processados; rejeita duplicados
 *     - Cache LRU 10k entradas, TTL 1h (~5min seria suficiente mas damos margem)
 *     - Em multi-instância, cada réplica tem seu cache — atacante teria que adivinhar qual responde
 *     - Para hardening futuro: Redis compartilhado
 *
 * Uso nos controllers:
 *   import { isReplayed, registerNonce, checkTimestampSkew } from 'App/Utils/WebhookReplayProtection';
 *   ...
 *   if (!checkTimestampSkew(unixTimestamp)) return response.status(401).send('stale');
 *   if (isReplayed(eventId)) return response.status(200).send('duplicate ignored');
 *   ...processar...
 *   registerNonce(eventId);
 *
 * Compatibilidade: se sem `eventId` (provider antigo), só faz timestamp check.
 */
import Logger from '@ioc:Adonis/Core/Logger';

const MAX_SKEW_SECONDS = 300; // 5 minutos
const MAX_NONCE_CACHE = 10_000;
const NONCE_TTL_MS = 60 * 60 * 1000; // 1h

// LRU simples: Map preserva ordem de inserção
const nonceCache = new Map<string, number>();

function purgeExpired() {
  const now = Date.now();
  let purged = 0;
  for (const [key, ts] of nonceCache) {
    if (now - ts > NONCE_TTL_MS) {
      nonceCache.delete(key);
      purged++;
    } else {
      break; // ordem de inserção: parar no primeiro válido
    }
  }
  if (purged > 0) Logger.debug({ purged }, 'WebhookReplayProtection: nonces expirados');
}

function enforceCacheCap() {
  while (nonceCache.size > MAX_NONCE_CACHE) {
    const firstKey = nonceCache.keys().next().value;
    if (firstKey === undefined) break;
    nonceCache.delete(firstKey);
  }
}

/**
 * Verifica se timestamp do webhook está dentro da janela permitida (±5min do clock atual).
 * @param unixTimestamp segundos desde epoch
 * @returns true se OK, false se muito velho ou muito futuro (clock skew suspeito)
 */
export function checkTimestampSkew(unixTimestamp: number | null | undefined): boolean {
  if (unixTimestamp == null || isNaN(unixTimestamp)) return false;
  const now = Math.floor(Date.now() / 1000);
  const skew = Math.abs(now - unixTimestamp);
  return skew <= MAX_SKEW_SECONDS;
}

/**
 * Verifica se um eventId já foi processado.
 * @param eventId identificador único do evento (ex: evt_xxx do Stripe, wamid.xxx do Meta)
 * @returns true se já visto (REPLAY), false se novo
 */
export function isReplayed(eventId: string | null | undefined): boolean {
  if (!eventId) return false; // sem ID, não dá pra detectar — passa adiante
  purgeExpired();
  return nonceCache.has(eventId);
}

/**
 * Registra que um eventId foi processado. Chamar APÓS sucesso do handler.
 */
export function registerNonce(eventId: string | null | undefined): void {
  if (!eventId) return;
  nonceCache.set(eventId, Date.now());
  enforceCacheCap();
}

/** Test helper. */
export function _clearForTest(): void {
  nonceCache.clear();
}

/** Debug: estado atual do cache. */
export function _cacheStats() {
  return { size: nonceCache.size, maxCap: MAX_NONCE_CACHE };
}
