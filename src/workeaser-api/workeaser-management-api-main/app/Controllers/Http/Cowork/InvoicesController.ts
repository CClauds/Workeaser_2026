import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import InvoiceService from 'App/Services/Cowork/InvoiceService';
import InvoicePdfService from 'App/Services/InvoicePdfService';
import LogService from 'App/Services/LogService';
import AppError from 'App/Utils/AppError';
import { responseWithPagination, responseWithSuccess } from 'App/Utils/ResponseApi';
import PaymentCaptureValidator from 'App/Validators/Cowork/Invoices/PaymentCaptureValidator';
import ReceivePaymentValidator from 'App/Validators/Cowork/Invoices/ReceivePaymentValidator';
import RefundPaymentValidator from 'App/Validators/Cowork/Invoices/RefundPaymentValidator';
import StoreInvoiceValidator from 'App/Validators/Cowork/Invoices/StoreInvoiceValidator';

export default class InvoicesController {
  async index({ request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const user = auth.user;
    const filters = request.all();
    const page = request.input('page', 1);

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const results = await InvoiceService.list(user, filters, page);

    return responseWithPagination(response, results);
  }

  async resend({ params, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const uuid = params.id;
    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const invoice = await InvoiceService.resend(uuid, user);

    return responseWithSuccess(response, invoice);
  }

  async show({ params, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const uuid = params.id;
    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const invoice = await InvoiceService.show(uuid, user);

    return responseWithSuccess(response, invoice);
  }

  async store({ request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const payload = await request.validate(StoreInvoiceValidator);
    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    // Validator marks `fees` and `resource_id` as optional (Lote 1, bug B04).
    // Service expects fees as `InvoiceItemFeeInterface[]` (required). Normalize
    // here at the boundary instead of widening the service contract.
    const normalized = {
      ...payload,
      items: payload.items.map((item: any) => ({ ...item, fees: item.fees ?? [] })),
    };

    const storeInvoice = await InvoiceService.store(user, normalized as any);
    await LogService.create(auth.user as any, 'INVOICE', 'STORE', storeInvoice.id);

    return responseWithSuccess(response, storeInvoice);
  }

  async update({ params, request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const payload = await request.validate(StoreInvoiceValidator);
    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const normalized = {
      ...payload,
      items: payload.items.map((item: any) => ({ ...item, fees: item.fees ?? [] })),
    };

    const updated = await InvoiceService.update(params.id, user, normalized as any);
    await LogService.create(auth.user as any, 'INVOICE', 'UPDATE', updated.id);

    return responseWithSuccess(response, updated);
  }

  async delete({ params, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    await InvoiceService.delete(params.id, user);
    await LogService.create(auth.user as any, 'INVOICE', 'DELETE', params.id);

    return responseWithSuccess(response);
  }

  async getInvoiceInfo({ params, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const id = params.id;
    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const invoice = await InvoiceService.getInvoiceInfo(id, user);

    return responseWithSuccess(response, invoice);
  }

  async receivePayment({ params, request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const payload = await request.validate(ReceivePaymentValidator);

    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const payment = await InvoiceService.receivePayment(params.id, user, payload);
    await LogService.create(auth.user as any, 'INVOICE', 'RECEIVE_PAYMENT', params.id);

    return responseWithSuccess(response, payment);
  }

  async capturePayment({ params, request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const payload = await request.validate(PaymentCaptureValidator);
    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const payment = await InvoiceService.capturePayment(params.id, user, payload);
    await LogService.create(auth.user as any, 'INVOICE', 'CAPTURE_PAYMENT', params.id);

    return responseWithSuccess(response, payment);
  }

  async refundPayment({ params, request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const payload = await request.validate(RefundPaymentValidator);
    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const payment = await InvoiceService.refundPayment(params.id, user, payload);
    await LogService.create(auth.user as any, 'INVOICE', 'REFUND_PAYMENT', params.id);

    return responseWithSuccess(response, payment);
  }

  async userPaymentMethods({ params, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const payment = await InvoiceService.getUserPaymentMethods(params.userId, user);

    return responseWithSuccess(response, payment);
  }

  /**
   * HF-SPRINT-N-02 — Download PDF da fatura.
   *
   * Retorna binário PDF com content-type correto e filename amigável.
   * Reusa `InvoiceService.show()` pra autorização cross-tenant (já checa user).
   * Se invoice tem items relation, usa-os; senão usa array vazio (PDF mostra só
   *   totais — útil pra demo data sem items detalhados).
   */
  async downloadPdf({ params, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    const user = auth.user;
    if (!user) throw new AppError(AppError.FORBIDDEN, 'Forbidden');

    const invoice: any = await InvoiceService.show(params.id, user);
    if (!invoice) throw new AppError(AppError.NOT_FOUND, 'Invoice not found');

    // Coleta dados defensivamente (campos podem vir de relations diferentes)
    const items = Array.isArray(invoice.items) ? invoice.items : [];
    const coworkName =
      invoice.coworkAccount?.name || invoice.cowork_account?.name || 'Workeaser';
    const clientName =
      invoice.clientAccount?.user?.firstName ||
      invoice.client?.first_name ||
      invoice.user?.first_name ||
      'Cliente';
    const clientEmail =
      invoice.clientAccount?.user?.email || invoice.client?.email || '';

    const pdf = await InvoicePdfService.generate({
      invoice,
      coworkName,
      clientName,
      clientEmail,
      items: items.map((it: any) => ({
        name: it.name || it.description || 'Item',
        description: it.description,
        quantity: Number(it.quantity || 1),
        unit_price: Number(it.unit_price || 0),
        total: Number(it.total || it.quantity * it.unit_price || 0),
      })),
    });

    await LogService.create(user as any, 'INVOICES', 'DOWNLOAD_PDF', invoice.id);

    response.header('Content-Type', 'application/pdf');
    response.header(
      'Content-Disposition',
      `inline; filename="fatura-${invoice.id}.pdf"`
    );
    return response.send(pdf);
  }
}
