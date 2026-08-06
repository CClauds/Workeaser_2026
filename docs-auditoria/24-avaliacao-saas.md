# Workeaser — Avaliação SaaS (24)

> **Data:** 06/08/2026 — Análise objetiva baseada na auditoria técnica + benchmark.

---

## 1. Nosso sistema é interno ou já compete como produto?

**Resposta: É um sistema INTERNO em estágio de protótipo funcional. NÃO compete como produto hoje.**

| Critério | Situação | Evidência |
|---|---|---|
| Estabilidade | Scheduler inativo, BoldSign quebrada, Stripe em teste | [RUNTIME] |
| Produção | Não existe (PC local, sem domínio/SSL/backup offsite) | [CONFIG + NAO_CONFIRMADO] |
| Dados operacionais | 81 tabelas vazias (0 faturas/contratos/pagamentos) | [BANCO] |
| Suporte/multi-tenancy | 1 cowork_account; isolamento entre clientes não verificado | [BANCO + NAO_CONFIRMADO] |
| API pública | Inexistente | [NAO_CONFIRMADO] |
| App móvel | Inexistente | [NAO_CONFIRMADO] |
| Testes | Quase inexistentes | [12-testes] |
| Segurança | Riscos P0 (cookie httpOnly, import exposto, placeholder creds) | [11-qualidade] |

## 2. Módulos em nível competitivo

| Módulo | Nível | Justificativa |
|---|---|---|
| Catálogo de serviços (VO/meetrooms/desks/locations) | Competitivo | Estrutura completa + dados reais |
| Multi-unidade (estrutura) | Competitivo | 10 locations |
| Auditoria | Competitivo | logs com IP/UA |
| WhatsApp nativo | SUPERIOR aos 10 concorrentes | único confirmado |
| Autenticação/RBAC | Competitivo | 3 roles + módulos |

## 3. Módulos abaixo do padrão de mercado

| Módulo | Gap |
|---|---|
| Operação financeira (invoices/payments/subscriptions) | Código existe, nunca usado, scheduler morto |
| Correspondências/mailroom | Estrutura vazia, sem scan/forward/USPS 1583 |
| App móvel | Ausente (todos os concorrentes têm) |
| Controle de acesso | Ausente |
| Contratos/e-sign | Quebrado |
| CRM operacional | Sem dados |
| API pública | Ausente |
| IA | Ausente |

## 4. Principal diferencial comprovado

**WhatsApp nativo (Meta Cloud)** — nenhum dos 10 concorrentes confirmou WhatsApp nativo nas fontes oficiais. Relevante para o mercado brasileiro/latino, onde WhatsApp é o canal padrão.

**Segundo diferencial:** catálogo VO detalhado + dados reais de 10 unidades e 240 clientes já carregados.

## 5. Maior deficiência

**Nenhuma automação roda (scheduler inativo) + nenhum dado operacional** — o sistema tem o esqueleto de um produto completo, mas nada do que "faz dinheiro" funciona: faturas não são geradas, pagamentos nunca ocorreram, filas nunca foram consumidas.

## 6. Cinco funções mais importantes que faltam

1. Scheduler/automações rodando (P0)
2. Fluxo operacional de correspondências + USPS 1583 (P0 — núcleo VO)
3. Produção + backup offsite (P0)
4. App/PWA do cliente (P1)
5. Integração contínua QBO (P1)

## 7. Melhorias que geram maior redução de trabalho manual

1. Faturas recorrentes automáticas (scheduler) — elimina geração manual
2. Correspondências com scan/notificação — elimina planilha de mail
3. Inadimplência automática — elimina follow-up manual de cobrança
4. Check-in QR — elimina registro manual de presença
5. Integração QBO — elimina lançamento contábil manual

## 8. Melhorias que geram maior aumento de receita

1. Cobrança recorrente funcionando (VO é mensal)
2. Day pass + reservas ativas (novas receitas)
3. Portal do cliente + app (retenção e upsell)
4. Eventos (nova linha de receita)
5. CRM funcional (conversão de leads)

## 9. Melhorias que reduzem mais os erros financeiros

1. Scheduler de faturas (evita fatura esquecida)
2. Integração QBO (elimina erro de lançamento manual)
3. Inadimplência automática (evita receita não registrada)
4. Reconciliação Plaid (match transação→fatura)
5. Stripe em produção com webhook validado (evita duplicidade)

## 10. Melhorias que aumentam a retenção de clientes

1. Portal do cliente funcional (transparência de faturas/correspondências)
2. App/PWA (conveniência)
3. Notificações de entrega de correspondência (VO)
4. WhatsApp (proximidade)
5. Suporte via tickets funcional

## 11. Suporta adequadamente dez unidades?

**Sim, na estrutura** — 10 locations cadastradas, dashboard por unidade, relatórios revenuebylocation. **Não, na operação** — sem dados de faturamento por unidade, sem permissões por unidade efetivas (módulos são globais ao cowork), sem calendário consolidado.

## 12. Suportaria cinquenta unidades?

**Não hoje.** Limitações: permissões por unidade não granulares; módulos por cowork_user são globais; sem isolamento robusto; PC local não escala; relatórios consolidados limitados; sem multi-marca.

## 13. Poderia ser licenciado para outros coworkings?

**Não hoje** (ver 24.1). Faltam: multi-tenancy real, isolamento de dados, API pública, app, produção, segurança, testes, documentação de produto, onboarding de operador, suporte.

## 14. Mudanças para transformá-lo em SaaS

| Área | Mudança | Esforço |
|---|---|---|
| Multi-tenancy | cowork_accounts já existe no schema (bom ponto de partida); completar isolamento por tenant em TODAS as queries | grande |
| Segurança | httpOnly, rate limit distribuído, credenciais reais, SSL | médio |
| Produção | VPS/cloud, CI/CD, backup, monitoramento | médio |
| API pública | Documentar + tokens + rate limits + webhooks públicos | médio |
| App | PWA → nativo | grande |
| Billing SaaS | Cobrança por locação/membro (inspiração: $60-349/mês dos concorrentes) | médio |
| Onboarding | Setup wizard por operador | médio |
| Suporte | Docs, help center, SLA | médio |
| Testes | Suíte completa | grande |

## 15. Ordem objetiva de desenvolvimento (para SaaS)

1. **Estabilizar operação EWS primeiro** (scheduler, produção, dados reais, correspondências) — o sistema precisa provar valor na própria operação
2. **Endurecer segurança** (P0) 
3. **Integrações contábeis** (QBO/Stripe produção)
4. **API pública + webhooks**
5. **Multi-tenancy real** (2º coworking piloto, ex.: Ocoee)
6. **App/PWA + controle de acesso**
7. **IA e comunidade** (último, pós-massa crítica)

**Conclusão estratégica:** NÃO vender o sistema até que a operação EWS rode 100% nele por ~3 meses sem intervenção manual. Só então licenciar (a partir do piloto com 1-2 coworkings externos).
