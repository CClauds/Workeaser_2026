import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { responseWithSuccess } from 'App/Utils/ResponseApi';
import LogService from 'App/Services/LogService';
import PublicInvoiceService from 'App/Services/PublicInvoiceService';
import PayPublicInvoiceValidator from 'App/Validators/PayPublicInvoiceValidator';

export default class PublicInvoicesController {
  async show({ params, response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const invoiceUuid = params.uuid;
    const invoice = await PublicInvoiceService.show(invoiceUuid);

    return responseWithSuccess(response, invoice);
  }

  async pay({ params, request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const invoiceUuid = params.uuid;
    const payload = await request.validate(PayPublicInvoiceValidator);
    const payment = await PublicInvoiceService.pay(invoiceUuid, payload, auth.user);

    if (auth.user) {
      await LogService.create(
        auth.user as any,
        'INVOICE',
        'CAPTURE_PAYMENT_EXTERNAL',
        payment.invoiceId
      );
    }

    return responseWithSuccess(response, payment);
  }

  async generatePdf({ params, response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const invoiceUuid = params.uuid;
    const invoice = await PublicInvoiceService.generatePdf(invoiceUuid);

    response.header('content-type', 'application/pdf');
    response.header('content-length', invoice.length);
    response.send(invoice);

    return response;
  }

  async checkInvoices({ response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const checked = await PublicInvoiceService.checkInvoiceReminder();

    return responseWithSuccess(response, checked);
  } // end checkInvoices
}
