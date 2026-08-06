import { BaseTask } from 'adonis5-scheduler/build';
import { DateTime } from 'luxon';
import {
  ContractPaymentStyleEnum,
  ContractStatusEnum,
  MeetingStatusEnum,
  ServicesEnum,
  TaxTypesEnum
} from 'Contracts/enums';
import {
  /*InvoiceService,*/ InvoiceItemFeeInterface,
  InvoiceItemRequestInterface
  //InvoiceRequestInterface,
} from 'App/Services/Cowork/InvoiceService';
import Contract from 'App/Models/Contract';
import TaxesService from 'App/Services/Cowork/TaxesService';
//import CoworkService from 'App/Services/Cowork/CoworkService';
import MeetingBilling from 'App/Models/MeetingBilling';
import InvoiceContract from 'App/Models/InvoiceContract';
import ContractRenewal from 'App/Models/ContractRenewal';
import ContractService from 'App/Services/Cowork/ContractService';
import CoworkSettingsService from 'App/Services/Cowork/SettingsService';

/**
 * GenerateInvoice — task legacy de geração mensal de invoices.
 *
 * ⚠️ HF-SPRINT-A-08: a parte que efetivamente CRIAVA o invoice estava
 * comentada por incompatibilidade com a assinatura nova de
 * `InvoiceService.store()`. Mantemos a coleta de dados (útil pra dashboards
 * e cálculo de cota), mas a criação automática DEPRECATA em favor de:
 *
 *   1. **Stripe Subscriptions** (caminho recomendado) — Stripe gera invoice
 *      mensal automaticamente quando o cliente está em um plano recorrente.
 *      Webhook `invoice.paid` / `invoice.payment_failed` sincroniza estado.
 *      Ver `app/Services/Cowork/StripeSubscriptionService.ts`.
 *
 *   2. Para invoices avulsos (day pass, meeting room sob demanda), usar
 *      `POST /api/cowork/finance/invoices` manualmente.
 *
 * Esta task continua rodando como "no-op observável" (loga o que faria) até
 * decisão final de Sprint B sobre se vale reimplementar para cobrir contratos
 * que NÃO usam Stripe Subscriptions (ex: cobrança manual/boleto/PIX direto).
 *
 * Para desabilitar completamente: comentar entrada em start/scheduler.ts (se houver)
 * ou setar env DISABLE_GENERATE_INVOICE_TASK=true.
 */
export default class GenerateInvoice extends BaseTask {
  public static get schedule() {
    return '0 2 * * *';
  }

  public static get useLock() {
    return false;
  }

  /**
   * Create invoices (LEGACY — ver comentário do header).
   * Mantém coleta de dados para visibilidade; criação real está desabilitada.
   */
  public async handle() {
    if ((process.env.DISABLE_GENERATE_INVOICE_TASK || '').toLowerCase() === 'true') {
      return;
    }
    interface ClientInterface {
      userId: number;
      contractIds: number[];
      meetingsIds: number[];
      items: InvoiceItemRequestInterface[];
    }

    // eslint-disable-next-line no-console
    console.log('[GenerateInvoice] task running (legacy mode — coleta sem criar invoice). Use Stripe Subscriptions para cobrança recorrente.');

    const today = DateTime.local();
    const dayOfMonth = today.day;

    const coworkings = await CoworkSettingsService.getByRecurringInvoiceCreation(dayOfMonth);

    for (const cowork of coworkings) {
      const coworkClients: ClientInterface[] = [];
      const coworkSettings = await CoworkSettingsService.getSettings(cowork.id);
      //const managers = await CoworkService.getCoworkManagers(cowork.id);
      let dueDate: DateTime = DateTime.local();

      // Calculate dueDate
      if (today.day > coworkSettings.recurringInvoiceDueDate) {
        dueDate = dueDate.plus({ month: 1 }).set({ day: coworkSettings.recurringInvoiceDueDate });
      } else {
        dueDate = dueDate.set({ day: coworkSettings.recurringInvoiceDueDate });
      }

      // Get cowork contracts
      const contracts = await Contract.query()
        .where('status', ContractStatusEnum.ACTIVE)
        .where('cowork_account_id', cowork.id)
        .where('date_end', '>', today.toFormat('yyyy-MM-dd'));

      for (const contract of contracts) {
        const lastInvoiceContract = await InvoiceContract.query()
          .where('contract_id', contract.id)
          .whereHas('invoice', (invoiceQuery) => {
            invoiceQuery.whereNull('deleted_at');
          })
          .orderBy('created_at', 'desc')
          .first();

        if (lastInvoiceContract) {
          const lastInvoiceDate = lastInvoiceContract.createdAt;
          let canCreateInvoice = false;

          switch (contract.paymentRecurringStyle) {
            case ContractPaymentStyleEnum.MONTHLY:
              if (today.month > lastInvoiceDate.month) {
                canCreateInvoice = true;
              }

              if (today.month < lastInvoiceDate.month && lastInvoiceDate.year < today.year) {
                canCreateInvoice = true;
              }

              break;
            case ContractPaymentStyleEnum.TOTAL:
              if (
                today.startOf('day').diff(lastInvoiceDate.startOf('day')).as('months') >=
                ContractService.getTermsizeInMonths(contract.termSize)
              ) {
                canCreateInvoice = true;
              }

              break;
          }

          if (!canCreateInvoice) {
            continue;
          }
        }

        // Get infos about service
        const serviceInfo = await ContractService.getServiceInfos(
          contract.resourceId,
          contract.serviceType,
          contract.termSize,
          contract.paymentRecurringStyle
        );

        // Check if invoice is renewal
        let isRenewal = false;
        let taxes: any[] = [];

        const lastRenewal = await ContractRenewal.query()
          .where('contract_id', contract.id)
          .orderBy('date_end', 'desc')
          .first();

        if (lastRenewal && !lastRenewal.isFirstInvoiceCreated) {
          lastRenewal.isFirstInvoiceCreated = true;
          await lastRenewal.save();
          isRenewal = true;
        }

        if (lastRenewal) {
          lastRenewal.generatedInvoice = true;
          await lastRenewal.save();
        }

        if (isRenewal) {
          // Get city, state and federal taxes
          const taxesRenewalTypes = [
            TaxTypesEnum.CITY_TAX,
            TaxTypesEnum.STATE_TAX,
            TaxTypesEnum.FEDERAL_TAX
          ];

          const taxesRenewal = await TaxesService.getAutomaticTaxes(
            contract.coworkAccountId,
            contract.serviceType
          );

          taxes = taxesRenewal.filter((tax) =>
            taxesRenewalTypes.includes(tax.type as TaxTypesEnum)
          );
        }

        const item: InvoiceItemRequestInterface = {
          name: serviceInfo.name,
          unit_price: contract.amount,
          service_type: contract.serviceType,
          resource_id: contract.resourceId,
          date: DateTime.local(),
          description: '',
          quantity: 1,
          fees: taxes
        };

        // Add to coworkClients array
        const clientIndex = coworkClients.findIndex((client) => client.userId === contract.userId);

        if (clientIndex >= 0) {
          coworkClients[clientIndex].contractIds.push(contract.id);
          coworkClients[clientIndex].items.push(item);
        } else {
          coworkClients.push({
            userId: contract.userId,
            contractIds: [contract.id],
            meetingsIds: [],
            items: [item]
          });
        }
      }

      // Get meetings
      const meetingsBillings = await MeetingBilling.query()
        .preload('meeting', (meetingQuery) => {
          meetingQuery.preload('taxes');
          meetingQuery.preload('meetroom');
        })
        .whereHas('meeting', (meetingQuery) => {
          meetingQuery.whereNull('invoice_id');
          meetingQuery.where('status', MeetingStatusEnum.APPROVED);
          meetingQuery.where('cowork_account_id', cowork.id);
        });

      for (const billing of meetingsBillings) {
        const taxes: InvoiceItemFeeInterface[] = [];

        billing.meeting.taxes.forEach((tax) => {
          taxes.push({
            recurring_type: tax.recurringType,
            method: tax.method,
            value: tax.value,
            name: tax.name,
            type: tax.type,
            taxes: []
          });
        });

        const costBilling = Math.round(
          (billing.quantityMinutes / 60) * (billing.meeting.pricePerHour / 100) * 100
        );

        const item: InvoiceItemRequestInterface = {
          name: `Meeting Room - ${billing.meeting.meetroom.name}`,
          unit_price: Math.max(0, costBilling - billing.meeting.amountDiscount),
          service_type: ServicesEnum.MEETING_ROOM,
          resource_id: billing.meeting.meetroomId,
          date: billing.meeting.createdAt,
          description: `From: ${billing.meeting.dateStart.toFormat(
            'MM/dd/yyyy HH:mm'
          )} - To: ${billing.meeting.dateEnd.toFormat('MM/dd/yyyy HH:mm')}`,
          quantity: 1,
          fees: taxes
        };

        // Add to coworkClients array
        const clientIndex = coworkClients.findIndex(
          (client) => client.userId === billing.meeting.userId
        );

        if (clientIndex >= 0) {
          coworkClients[clientIndex].meetingsIds.push(billing.meeting.id);
          coworkClients[clientIndex].items.push(item);
        } else {
          coworkClients.push({
            userId: billing.meeting.userId,
            contractIds: [],
            meetingsIds: [billing.meeting.id],
            items: [item]
          });
        }
      }

      //Create invoice
      // for (const client of coworkClients) {
      //   const invoiceData: InvoiceRequestInterface = {
      //     user_id: client.userId,
      //     date: today,
      //     due_date: dueDate,
      //     items: client.items,
      //     contracts: client.contractIds,
      //     meetings: client.meetingsIds,
      //   };

      //   // modified to virtual offices local ids
      //   // const toIterateOverLocId = await InvoiceService.toIterateOverAccountId(user);
      //   // let nextLocId;

      //   // if(toIterateOverLocId){
      //   //   nextLocId = toIterateOverLocId.invoice_local_account_id;
      //   //   nextLocId++
      //   // }else {
      //   //   nextLocId = 1;
      //   // }

      //    await InvoiceService.store(managers[0], invoiceData);
      // }
    }
  }
}
