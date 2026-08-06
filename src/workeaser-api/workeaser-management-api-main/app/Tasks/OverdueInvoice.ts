import Invoice from 'App/Models/Invoice';
import NotificationsService from 'App/Services/NotificationsService';
import { BaseTask } from 'adonis5-scheduler/build';
import { InvoiceStatusEnum, NotificationTypeEnum } from 'Contracts/enums';

export default class OverdueInvoice extends BaseTask {
  public static get schedule() {
    return '0 5 * * * *';
  }

  public static get useLock() {
    return false;
  }

  public async handle() {
    const invoices: Invoice[] = await Invoice.query()
      .whereRaw('due_date = CURDATE() - INTERVAL 1 DAY')
      .whereIn('status', [
        InvoiceStatusEnum.SENT,
        InvoiceStatusEnum.PARTLY_PAID,
        InvoiceStatusEnum.VIEWED
      ]);

    for (const invoice of invoices) {
      await NotificationsService.create({
        title: 'Overdue Invoice',
        message: 'Your invoice expired yesterday',
        type: NotificationTypeEnum.CLIENT,
        client_id: invoice.userId,
        cowork_account_id: invoice.coworkAccountId
      });
    }
  }
}
