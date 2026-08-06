import CoworkClient from 'App/Models/CoworkClient';
import Location from 'App/Models/Location';
import { InvoiceStatusEnum } from 'Contracts/enums';

interface SubscriptionData {
  locations: number;
  customers: number;
}

export default class NotificationsService {
  static async show(coworkAccountId: number): Promise<SubscriptionData> {
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
}
