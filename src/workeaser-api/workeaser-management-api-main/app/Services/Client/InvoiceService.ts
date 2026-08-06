import Env from '@ioc:Adonis/Core/Env';
import PaymentService from '@ioc:Workeaser/Integrations/Payments';
import Invoice from 'App/Models/Invoice';
import InvoiceActivity from 'App/Models/InvoiceActivity';
import Payment from 'App/Models/Payment';
import User from 'App/Models/User';
import AppError from 'App/Utils/AppError';
import { IntegrationServiceEnum, InvoiceStatusEnum, PaymentStatusEnum } from 'Contracts/enums';

interface PaymentsToRefund {
  paymentId: number;
  amount: number;
}

export default class InvoiceService {
  static async list(user: User, filters: any, paginate = true, page = 1) {
    const query = Invoice.query().where('user_id', user.id);

    // Filter creation date
    if (filters.creation_date_start && filters.creation_date_end) {
      query.whereBetween('date', [filters.creation_date_start, filters.creation_date_end]);
    } else if (filters.creation_date_start) {
      query.where('date', filters.creation_date_start);
    } else if (filters.creation_date_end) {
      query.where('date', filters.creation_date_end);
    }

    // Filter due date
    if (filters.due_date_start && filters.due_date_end) {
      query.whereBetween('due_date', [filters.due_date_start, filters.due_date_end]);
    } else if (filters.due_date_start) {
      query.where('due_date', filters.due_date_start);
    } else if (filters.due_date_end) {
      query.where('due_date', filters.due_date_end);
    }

    if (filters.status) {
      query.where('status', filters.status);
    }

    return (await paginate) ? query.paginate(page, Env.get('ITEMS_PER_PAGE')) : query;
  }

  static async show(uuid: string, user: User) {
    const invoice = await Invoice.query().where('uuid', uuid).where('user_id', user.id).first();

    if (!invoice) {
      throw new AppError(AppError.NOT_FOUND, 'Invoice not found');
    }

    if (invoice.status === InvoiceStatusEnum.SENT) {
      invoice.status = InvoiceStatusEnum.VIEWED;
      await invoice.save();

      await InvoiceActivity.create({
        invoiceId: invoice.id,
        type: InvoiceStatusEnum.VIEWED
      });
    }

    return await invoice.getDetailed();
  }

  static async refundPayment(paymentId: number, amount: number) {
    const payment = await Payment.query().where('id', paymentId).first();

    if (!payment) {
      throw new AppError(AppError.NOT_FOUND, 'Payment not found');
    }

    if (
      payment.status === PaymentStatusEnum.FAILED ||
      payment.status === PaymentStatusEnum.PENDING ||
      payment.status === PaymentStatusEnum.REFUNDED
    ) {
      throw new AppError(AppError.BAD_REQUEST, 'This payment is not available for refund');
    }

    const totalToRefund = amount ? amount : payment.amount;

    if (!payment.gatewayId) {
      throw new AppError(AppError.LOGIC_ERROR, 'An unexpected error occurred');
    }

    await PaymentService.refund({ charge: payment.gatewayId, amount: totalToRefund });
  }

  static async calculatePaymentsInvoices(invoiceId: number) {
    const payments = await Payment.query()
      .where('invoice_id', invoiceId)
      .whereNotIn('status', [PaymentStatusEnum.REFUNDED, PaymentStatusEnum.FAILED]);

    const subtotal = payments.reduce((acc, curr) => acc + curr.available, 0);

    return subtotal;
  }

  // Receive the invoice id and the total amount to cancel.
  // Select all invoice payments and chooses which payments and amount will be refund.
  // P.S: Get only Stripe Payments
  static async calcPaymentsToRefund(
    id: number,
    amountToCancel: number
  ): Promise<PaymentsToRefund[]> {
    let amount = amountToCancel;
    const result: PaymentsToRefund[] = [];

    const payments: Payment[] = await Payment.query()
      .where('invoice_id', id)
      .whereIn('status', [PaymentStatusEnum.PARTLY_REFUNDED, PaymentStatusEnum.SUCCEEDED])
      .where('integration_service', IntegrationServiceEnum.STRIPE);

    for (const payment of payments) {
      if (amount === 0) break;

      if (payment.available >= amount) {
        result.push({ paymentId: payment.id, amount: amount });
        amount = 0;
      } else if (payment.available < amount) {
        result.push({ paymentId: payment.id, amount: payment.available });
        amount -= payment.available;
      }
    }

    return result;
  }
}
