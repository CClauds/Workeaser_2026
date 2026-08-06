# Workeaser — Jobs, Webhooks e Automações (09)

> **Data:** 06/08/2026 — Modo 100% leitura
> **Evidências:** [CODIGO] · [BANCO] · [RUNTIME]

---

## 1. ACHADO CRÍTICO: scheduler NÃO está rodando

- O container `workeaser-api` executa apenas `node server.js` (verificado via /proc: PID 1 = tini → node server.js; nenhum processo `ace scheduler:run`) [RUNTIME]
- O `adonis5-scheduler` está como provider (.adonisrc.json) e expõe o comando `scheduler:run` (README do pacote), mas o server.js não o inicia [CODIGO]
- **Consequência:** NENHUMA das 8 tasks executa; nenhuma fila é consumida

## 2. Tasks (adonis5-scheduler)

| Task | Cron | Frequência | Função | Roda? |
|---|---|---|---|---|
| GenerateInvoice | 0 2 * * * | diária 2h | Gera faturas recorrentes | ❌ |
| OverdueInvoice | 0 5 * * * * | a cada hora (min 5) | Marca faturas vencidas | ❌ |
| PlaidReconciliation | 0 */2 * * * | 2h | Match transação→invoice | ❌ |
| ProcessDataDeletion | 0 3 * * * | diária 3h | LGPD: processa data_deletion_requests vencidos | ❌ |
| ProcessEmailQueue | * * * * * | 1min | Envia email_queue via SES | ❌ |
| ProcessWebhookRetryQueue | */5 * * * * | 5min | Retenta webhook_dead_letter_queue | ❌ |
| ProcessWhatsappQueue | * * * * * | 1min | Envia whatsapp_messages | ❌ |
| RenewContractTask | 0 1 * * * | diária 1h | Renova contracts | ❌ |

**Formato do cron:** adonis5-scheduler usa 6 campos (alguns com 5 — verificar compatibilidade; ex.: OverdueInvoice `0 5 * * * *` tem 6, GenerateInvoice `0 2 * * *` tem 5) [CODIGO — possível divergência de formato entre tasks]

## 3. Filas (tabelas MySQL)

| Fila | Consumidor | Producer | Linhas | Status |
|---|---|---|---|---|
| email_queue | ProcessEmailQueue | evento onboarding + outros | 0 | 🔴 não consumida |
| webhook_dead_letter_queue | ProcessWebhookRetryQueue | webhooks com falha | 0 | 🔴 não consumida |
| whatsapp_messages | ProcessWhatsappQueue | WhatsappController | 0 | 🔴 não consumida |
| data_deletion_requests | ProcessDataDeletion | AccountDeletionController | 0 | 🔴 não consumida |

## 4. Eventos

| Evento | Listener | Ação |
|---|---|---|
| user:email_confirmed | start/events/user.ts | OnboardingEmailService.scheduleSequence → 3 emails (dia 0, 3, 7) na email_queue; idempotente; só para COWORKING role [CODIGO] |

## 5. Webhooks (endpoints)

| Webhook | Endpoint | Validação | Efeito | Falha→ |
|---|---|---|---|---|
| Stripe | POST /api/webhooks/stripe | constructEvent + nonce | sincroniza invoice.paid/payment_failed | DLQ |
| SES | POST /api/webhooks/ses | anti-replay MessageId | bounce/complaint | DLQ |
| WhatsApp | GET (verify) / POST (store) /api/webhooks/whatsapp | token + HMAC | recebe mensagens | DLQ |
| Docusign | POST /api/webhooks/docusign | header X-ADOBESIGN-CLIENTID | status de envelope | DLQ |
| BoldSign | POST /api/webhooks/boldsign | HMAC x-boldsign-signature | status de documento | DLQ |
| AdobeSign | GET/POST /api/webhooks/adobesign | não valida | eventos | DLQ |

**Admin de DLQ:** GET/POST /api/admin/webhook-dlq (stats, show, retry, discard) + páginas /admin/webhook-dlq no frontend [CODIGO]

## 6. Importações/Exportações

| Tipo | Mecanismo | Uso real |
|---|---|---|
| Import de clientes | POST /api/cowork/clients/import + /import-simple | Carga QBO (240) via script externo [BANCO] |
| Export de clientes | GET /api/cowork/clients/export | não usado |
| Import/export de locations/desks/meetrooms/rooms/VO | rotas import/export | não usado |
| Import de users | POST /api/auth/import (sem auth!) | usado pelo import-qbo-customers.py [BANCO] |

## 7. Automação de email (onboarding)

1. COWORKING confirma email → evento user:email_confirmed
2. OnboardingEmailService.scheduleSequence → enfileira 3 emails (dia 0 welcome, dia 3 dica, dia 7 check-in)
3. ProcessEmailQueue enviaria via SES — ❌ não roda [CODIGO + RUNTIME]

## 8. Monitoramento e reprocessamento

| Aspecto | Situação |
|---|---|
| Monitoramento das tasks | ❌ nenhum (não rodam) |
| Reprocessamento manual de DLQ | ✅ Admin/WebhookDLQController.retry [CODIGO] |
| Logs | pino no stdout do container [RUNTIME] |
| Risco de execução duplicada | ProcessEmailQueue/Onboarding idempotente (checa sequência existente) [CODIGO]; demais sem idempotência confirmada |
