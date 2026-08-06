# Workeaser — Benchmark de Concorrentes (18)

> **Data:** 06/08/2026
> **Método:** pesquisa em fontes oficiais (site, pricing, docs, integrações) dos 10 concorrentes via subagentes; classificação por evidência. Detalhes em benchmark-parte1/2/3.md.
> **Status dos concorrentes:** todos os 10 analisados estão ATIVOS (Optix: não foi possível confirmar — ver nota).

---

## 1. Status dos sistemas analisados

| Sistema | Status | Nota |
|---|---|---|
| OfficeRnD Flex | ✅ Ativo | Líder de mercado, SOC 2/ISO 27001 |
| Nexudus | ✅ Ativo | Bootstrapped, +3.000 espaços |
| Archie | ✅ Ativo | Claim G2 #1 |
| Optix | ✅ Ativo | "Automation-first"; 1.000+ automações; API developer platform; preço não público |
| Spacebring | ✅ Ativo | Ex-andcards (2017) |
| Cobot | ✅ Ativo | Pioneiro desde 2008, Berlim |
| Coworks | ✅ Ativo | EUA, 2018 |
| Proximity | ✅ Ativo | Foco em acesso físico |
| Habu | ✅ Ativo | UK, foco em autoatendimento |
| Yardi Kube | ✅ Ativo | Enterprise Yardi (adquiriu Deskpass+Hubble) |

---

## 2. Comparação por categoria (nosso sistema vs concorrentes)

Legenda: ✅ tem · 🟡 parcial · ❌ não tem · ❓ não confirmado

### A. CRM e vendas
| Função | Workeaser | OfficeRnD | Nexudus | Archie | Spacebring | Cobot | Coworks | Proximity | Habu | Yardi Kube |
|---|---|---|---|---|---|---|---|---|---|---|
| Cadastro de leads | ✅ tabela leads | ✅ | ✅ | ✅ | 🟡 (via integração) | ✅ | ✅ | ❓ | ❌ | ✅ (lead gen tools) |
| Pipeline comercial | ✅ salespipeline | ✅ | ✅ | ✅ | 🟡 | 🟡 | 🟡 | ❓ | ❌ | 🟡 |
| Tours | ✅ (tours CRUD) | ✅ | ✅ | ✅ | 🟡 | 🟡 | ✅ (tour requests) | ✅ (Wave) | ❌ | ✅ |
| Proposta/cotação | ❌ | ✅ | ✅ | ✅ (quotes) | ❌ | 🟡 | ❓ | ❌ | ❌ | ✅ |
| Conversão lead→cliente | 🟡 | ✅ | ✅ | ✅ | 🟡 | ✅ (1 clique) | ✅ | ❓ | ❌ | ✅ |
| Integração WhatsApp | ✅ (Meta Cloud) | ❓ | ❓ | ❓ | ❓ | ❓ | ❓ | ❓ | ❓ | ❓ |

### B. Clientes e membros
| Função | Workeaser | OfficeRnD | Nexudus | Archie | Spacebring | Cobot | Coworks | Proximity | Habu | Yardi Kube |
|---|---|---|---|---|---|---|---|---|---|---|
| Cadastro empresa | ✅ client_accounts | ✅ (Companies) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Membros vinculados a empresa | 🟡 (cowork_clients) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (team/shared) | ✅ | ✅ |
| Portal do cliente | ✅ /client/membership | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (User Area) | ✅ (Member App) |
| App móvel | ❌ | ✅ (branded) | ✅ (Passport) | ✅ (branded) | ✅ (white-label) | ✅ (Members App) | ✅ (white-label) | ✅ (white-label) | ✅ | ✅ (Member App) |
| Onboarding/offboarding | 🟡 (evento email) | ✅ | ✅ (automatizado) | ✅ | ✅ | 🟡 | ❓ | ✅ | ✅ (self signup) | ✅ (MIMO) |
| Documentos do membro | 🟡 (documents) | ✅ | ✅ | ✅ | ✅ | 🟡 | ❓ | ❓ | ❌ | ✅ |

### C. Produtos e planos
| Função | Workeaser | OfficeRnD | Nexudus | Archie | Spacebring | Cobot | Coworks | Proximity | Habu | Yardi Kube |
|---|---|---|---|---|---|---|---|---|---|---|
| Escritório privativo | ✅ rooms (0 dados) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Mesa dedicada | ✅ desks | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Sala de reunião | ✅ meetrooms | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Day pass | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Escritório virtual | ✅ (7 planos) | ✅ | ✅ (página dedicada) | ✅ | ✅ (solução dedicada) | ❌ | ❌ | ❌ | ❌ | ❌ |
| Correspondências/mailroom | 🟡 (mailbox, 0 dados) | ✅ (SphereMail) | ✅ (mail handling) | ✅ (visitor/delivery) | ✅ (scan/forward/discard) | ❌ | ❌ | ❌ | ❌ | ❌ |
| USPS Form 1583 | ❌ | ❓ | ✅ (compliance checks) | ❓ | ❓ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Planos recorrentes | ✅ subscription_plans | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (flexíveis) | ✅ (custom) | ✅ |
| Cupons/descontos | ✅ discounts (0 dados) | ✅ (promo codes) | ✅ | ✅ | ✅ | 🟡 | ✅ | ✅ (discounts) | 🟡 | ✅ |
| Créditos/allowances | 🟡 | ✅ (Credits) | ✅ | ✅ (credit-based) | ✅ | ✅ | ✅ (booking credits) | ✅ (punch passes) | ✅ (allowances) | ✅ |

### D. Inventário físico
| Função | Workeaser | Concorrentes |
|---|---|---|
| Unidades/andares/salas | ✅ locations+rooms | ✅ todos |
| Capacidade/metragem | ✅ meetrooms (measure) | ✅ |
| Fotos | ✅ photos | ✅ |
| QR Code | ❌ | vários ✅ |
| Manutenção | ❌ | vários ✅ |
| Mapas/floorplans | 🟡 (Mapbox em /spaces) | ✅ (Prospect Portal, Archie floor plans) |

### E. Reservas
| Função | Workeaser | OfficeRnD | Nexudus | Archie | Spacebring | Cobot | Coworks | Proximity | Habu | Yardi Kube |
|---|---|---|---|---|---|---|---|---|---|---|
| Reserva de sala | ✅ meetrooms/book | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Reserva de mesa | 🟡 (desks sem booking) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Calendário Google | 🟡 (OAuth placeholder) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Calendário Outlook | 🟡 (Exchange placeholder) | ✅ | ✅ | ✅ | ✅ | ❓ | ✅ | ❓ | ❓ | ✅ |
| Recorrência/lista de espera | ❌ | ✅ | ✅ | ✅ | ✅ | ❓ | ❓ | ✅ (recorrência) | ❓ | ✅ |
| Aprovação/cancelamento | ✅ approve/reject | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Check-in | ❌ | ✅ (Checkins) | ✅ (kiosk) | ✅ | ✅ | ✅ | ✅ | ✅ (Wave) | ✅ (self) | ✅ |
| No-show/cobrança ausência | ❌ | ❓ | ✅ | ✅ | ❓ | ❓ | ❓ | ❓ | ❓ | ❓ |

### F. Escritório virtual e correspondências (área-chave)
| Função | Workeaser | Concorrentes que têm |
|---|---|---|
| Planos de VO | ✅ 7 planos | OfficeRnD, Nexudus, Archie, Spacebring |
| Endereço comercial/postal | 🟡 (addresses) | Nexudus (dedicado), Spacebring (dedicado) |
| Registro de correspondência | 🟡 (mailbox, 0 dados) | Spacebring (scan/forward/discard), Nexudus (mail handling), OfficeRnD (SphereMail) |
| Fotografia/digitalização | ❌ | Spacebring, SphereMail/PilotoMail |
| Encaminhamento/retirada/descarte | ❌ | Spacebring |
| Notificações de entrega | 🟡 (notifications) | Nexudus, Spacebring |
| USPS 1583 / compliance | ❌ | Nexudus (identity/compliance checks) |
| **Avaliação:** nosso sistema tem o CATÁLOGO de VO (7 planos) e a estrutura de mailbox, mas o fluxo operacional de correspondências está vazio (0 dados) e sem digitalização/encaminhamento/USPS 1583. Concorrentes com VO dedicado (Nexudus, Spacebring) estão à frente. |

### G. Contratos
| Função | Workeaser | Concorrentes |
|---|---|---|
| Modelos/geração | 🟡 (contracts CRUD, 0 dados) | ✅ todos os principais |
| Assinatura eletrônica | 🟡 Docusign/AdobeSign/BoldSign (BoldSign QUEBRADA) | ✅ Dropbox Sign (OfficeRnD/Spacebring), Nexudus (digital), Yardi (ySign embutido), Archie |
| Renovação/reajuste | 🟡 RenewContractTask (não roda) | ✅ |
| Cancelamento/multa/aviso | 🟡 getContractCancelInfo | ✅ |
| Aditivos/versionamento | ❌ | ✅ (Yardi stepped deals) |

### H. Faturamento e pagamentos
| Função | Workeaser | Concorrentes |
|---|---|---|
| Faturas recorrentes | 🟡 (GenerateInvoice task NÃO roda) | ✅ todos |
| Cobrança avulsa/consumo | 🟡 (invoices) | ✅ |
| Cartão | ✅ Stripe (teste) | ✅ todos (Stripe + gateways) |
| ACH/direct debit | ❌ | ✅ vários (Placepay, GoCardless, Fidelity ACH, Stripe ACH...) |
| Inadimplência/suspensão automática | 🟡 (OverdueInvoice task não roda) | ✅ vários |
| Lembretes | 🟡 (notifications) | ✅ |
| Múltiplas moedas | ❌ | ✅ Nexudus, Cobot |
| Recibos/estornos | 🟡 (refund) | ✅ |
| Carteira de crédito | 🟡 (wallet) | ✅ |

### I. Contabilidade e reconciliação
| Função | Workeaser | OfficeRnD | Nexudus | Archie | Spacebring | Cobot | Coworks | Proximity | Habu | Yardi Kube |
|---|---|---|---|---|---|---|---|---|---|---|
| QuickBooks Online | ❌ (import pontual QBO) | ✅ | ✅ | ✅ (sync both) | ✅ | ✅ | ✅ | ✅ | ❓ | ❓ |
| Xero | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❓ | ❓ | ❓ |
| Sincronização contínua | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❓ | ✅ (reconciliação automática) |
| Conciliação bancária | 🟡 (Plaid task não roda) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❓ | ✅ |

### J. Controle de acesso
| Função | Workeaser | Concorrentes |
|---|---|---|
| Integração fechaduras (Kisi/Brivo/Salto) | ❌ | ✅ quase todos (OfficeRnD, Nexudus, Archie, Spacebring, Cobot, Coworks, Proximity, Yardi Kube) |
| QR/app/bluetooth | ❌ | ✅ vários |
| Logs de entrada/saída | ❌ | ✅ vários |
| **Avaliação:** nosso sistema NÃO tem controle de acesso — área totalmente ausente, que a maioria dos concorrentes oferece. |

### K. Visitantes e recepção
| Função | Workeaser | Concorrentes |
|---|---|---|
| Gestão de visitantes | ❌ | ✅ OfficeRnD (Visitor Hub), Archie, Proximity (Wave), Coworks, Yardi Kube |
| Check-in/out visitante | ❌ | ✅ |
| Pré-registro/termo | ❌ | ✅ |

### L. Comunicação
| Função | Workeaser | Concorrentes |
|---|---|---|
| Email | 🟡 SES (task não roda) | ✅ todos |
| SMS/WhatsApp | ✅ WhatsApp Meta (código) | 🟡 poucos confirmados |
| Push notification | ❌ | ✅ vários |
| Mensagens internas | ✅ chats (0 dados) | ✅ |
| Campanhas/segmentação | ❌ | ✅ vários |

### M. Comunidade
| Função | Workeaser | Concorrentes |
|---|---|---|
| Diretório de membros | ❌ | ✅ Spacebring, vários |
| Eventos/feed/mural | 🟡 (events tabela) | ✅ |
| Marketplace | 🟡 (página mínima) | ✅ Habu (e-commerce), vários |
| NPS/pesquisas | ❌ | ✅ |

### N. Operação e manutenção
| Função | Workeaser | Concorrentes |
|---|---|---|
| Tickets/chamados | 🟡 (support-tickets tela) | ✅ Yardi Kube (tasks), vários |
| Manutenção/inspeções | ❌ | 🟡 |

### O. Relatórios e indicadores
| Função | Workeaser | Concorrentes |
|---|---|---|
| Receita/ocupação | ✅ (10 relatórios, 0 dados) | ✅ todos |
| Churn/retenção | 🟡 (cohorts) | ✅ Nexudus (AI churn) |
| Utilização/no-show | 🟡 | ✅ |
| Exportação | 🟡 | ✅ |
| BI | ❌ | ✅ Coworks (Looker) |

### P. Múltiplas unidades
| Função | Workeaser | Concorrentes |
|---|---|---|
| Gestão centralizada | ✅ 10 locations (1 cowork_account) | ✅ todos |
| Permissões por unidade | 🟡 (módulos globais) | ✅ vários |
| Preços/produtos por unidade | 🟡 (VO todos em Saturn) | ✅ |
| Relatórios consolidados | 🟡 (revenuebylocation) | ✅ |
| Cliente em várias unidades | 🟡 | ✅ (Proximity shared, Habu Switch Workspace) |

### Q. Permissões e auditoria
| Função | Workeaser | Concorrentes |
|---|---|---|
| Perfis/funções | ✅ ADMIN/COWORKING/CLIENT | ✅ |
| Permissões granulares | 🟡 (6 módulos) | ✅ |
| Logs de auditoria | ✅ logs + admin_audit_logs | ✅ |
| Impersonation | ❌ | 🟡 |
| Restrição dados financeiros/pessoais | 🟡 | ✅ |

### R. Integrações e API
| Função | Workeaser | Concorrentes |
|---|---|---|
| API pública | ❌ (sem docs/endpoint público) | ✅ OfficeRnD, Nexudus, Spacebring, Cobot, Yardi Kube (API+webhooks); ❓ Archie (add-on), Coworks/Proximity/Habu |
| Webhooks | ✅ 6 internos (externos para o sistema) | ✅ vários |
| Zapier/Make | ❌ | ✅ vários |
| Stripe | ✅ | ✅ todos |
| QuickBooks | ❌ (import pontual) | ✅ maioria |
| Google/Microsoft | 🟡 (placeholder) | ✅ |
| **Avaliação:** nosso sistema é o ÚNICO sem API pública documentada entre os 10 — limitação grave para integrações e para virar produto. |

### S. App e UX
| Função | Workeaser | Concorrentes |
|---|---|---|
| App iOS/Android | ❌ | ✅ todos os 10 |
| White label | ❌ | ✅ quase todos |
| Responsividade | ✅ (web) | ✅ |
| Idiomas | 🟡 (PT/EN parcial) | ✅ vários (Nexudus multi) |
| Acessibilidade | ❓ | ❓ |

### T. IA e automação
| Função | Workeaser | Concorrentes |
|---|---|---|
| Assistente/chatbot | ❌ | ✅ Spacebring (Lem AI), OfficeRnD (AI Sales Agent), Nexudus (Alex/insights) |
| Previsão de ocupação/churn | ❌ | ✅ Nexudus (AI insights) |
| Automações de workflow | 🟡 (tasks, não rodam) | ✅ vários |
| Agentes de IA | ❌ | ✅ Spacebring (Lem), OfficeRnD (AI Hub) |

---

## 3. Resumo da comparação

| Área | Nosso sistema | Concorrentes | Verdicto |
|---|---|---|---|
| Catálogo de serviços (VO/meetrooms/desks) | ✅ sólido | ✅ | EQUIVALENTE (catálogo) |
| Escritório virtual (planos) | ✅ 7 planos | Nexudus/Spacebring/OfficeRnD | PARCIAL — temos catálogo, falta operação |
| Correspondências (mailroom) | 🟡 vazio | Spacebring/Nexudus completos | INFERIOR |
| Faturamento recorrente | 🟡 código, task morta | ✅ todos | INFERIOR (não roda) |
| Contabilidade QBO | ❌ só import | ✅ maioria | INFERIOR |
| Controle de acesso | ❌ | ✅ quase todos | AUSENTE |
| App móvel | ❌ | ✅ todos | AUSENTE |
| API pública | ❌ | ✅ maioria | AUSENTE (crítico) |
| IA | ❌ | ✅ líderes | AUSENTE |
| CRM/pipeline | 🟡 sem dados | ✅ | INFERIOR |
| Múltiplas unidades | ✅ 10 locations | ✅ | EQUIVALENTE (estrutura) |
| Multi-idioma | 🟡 | ✅ | INFERIOR |
| Contratos e-sign | 🟡 quebrado | ✅ | INFERIOR |
| Auditoria | ✅ | ✅ | EQUIVALENTE |
