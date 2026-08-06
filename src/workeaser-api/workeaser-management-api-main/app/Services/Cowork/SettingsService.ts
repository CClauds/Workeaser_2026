import Location from 'App/Models/Location';
import CoworkClient from 'App/Models/CoworkClient';
import CoworkAccount from 'App/Models/CoworkAccount';
import CoworkSetting from 'App/Models/CoworkSetting';
import { InvoiceStatusEnum } from 'Contracts/enums';

interface SubscriptionData {
  locations: number;
  customers: number;
}

export default class CoworkSettingsService {
  static async search(coworkAccountId: number, key: string) {
    const search = await CoworkSetting.query().where('cowork_account_id', coworkAccountId).first();

    if (!search) {
      return null;
    }

    return search[key];
  }

  static async getSettings(coworkAccountId: number) {
    const settings = await CoworkSetting.query()
      .where('cowork_account_id', coworkAccountId)
      .first();

    if (!settings) {
      const newSettings = await CoworkSetting.create({
        coworkAccountId: coworkAccountId,
        recurringInvoiceCreation: 1,
        recurringInvoiceDueDate: 3
      });

      return newSettings;
    }

    return settings;
  }

  static async subscriptions(coworkAccountId: number): Promise<SubscriptionData> {
    const result: SubscriptionData = {
      locations: 0,
      customers: 0
    };

    // Calc locations quantity
    const locations = await Location.query()
      .where('cowork_account_id', coworkAccountId)
      .count('*', 'total');

    // Calc customers actives quantity
    const clients = await CoworkClient.query()
      .where('cowork_account_id', coworkAccountId)
      .whereHas('user', (u) => {
        u.whereNull('deleted_at');
        u.where((q) => {
          q.whereHas('invoices', (invoiceQuery) => {
            invoiceQuery.where('cowork_account_id', coworkAccountId);
            invoiceQuery.whereIn('status', [
              InvoiceStatusEnum.SENT,
              InvoiceStatusEnum.VIEWED,
              InvoiceStatusEnum.PARTLY_PAID
            ]);
          });
          q.orWhereHas('invoices', (invoiceQuery) => {
            invoiceQuery.where('cowork_account_id', coworkAccountId);
            invoiceQuery.whereRaw('date BETWEEN CURDATE() - INTERVAL 30 DAY AND CURDATE()');
          });
        });
      })
      .count('*', 'total');

    result.customers = clients[0].$extras.total;
    result.locations = locations[0].$extras.total;

    return result;
  }

  static async update(coworkAccountId: number, payload: any) {
    const search = await CoworkSetting.query().where('cowork_account_id', coworkAccountId).first();

    if (!search) {
      const newSetting = await CoworkSetting.create({
        coworkAccountId: coworkAccountId,
        recurringInvoiceCreation: payload.recurring_invoice_creation,
        recurringInvoiceDueDate: payload.recurring_invoice_due_date
      });

      return newSetting;
    }

    search.merge(payload);
    await search.save();

    return search;
  }

  static async getByRecurringInvoiceCreation(day: number) {
    const coworkings = await CoworkSetting.query()
      .where('recurring_invoice_creation', day)
      .whereHas('coworkAccount', (coworkQuery) => {
        coworkQuery.whereNull('deleted_at');
      });

    const coworkingsIds = coworkings.map((cowork) => cowork.coworkAccountId);
    const coworkAccounts = await CoworkAccount.query().whereIn('id', coworkingsIds);

    return coworkAccounts;
  }
}
