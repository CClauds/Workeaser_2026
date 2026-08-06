import Route from '@ioc:Adonis/Core/Route';
import { CoworkModulesEnum } from 'Contracts/enums';

Route.group(() => {
  Route.get('/', 'Cowork/InvoicesController.index');
  Route.post('/', 'Cowork/InvoicesController.store');
  Route.get('/info/:id', 'Cowork/InvoicesController.getInvoiceInfo');
  Route.post('/resend/:id', 'Cowork/InvoicesController.resend');
  Route.post('/receivepayment/:id', 'Cowork/InvoicesController.receivePayment');
  Route.post('/capturepayment/:id', 'Cowork/InvoicesController.capturePayment');
  Route.post('/refundpayment/:id', 'Cowork/InvoicesController.refundPayment');
  Route.get('/userpaymentmethods/:userId', 'Cowork/InvoicesController.userPaymentMethods');
  Route.get('/:id/pdf', 'Cowork/InvoicesController.downloadPdf'); // HF-SPRINT-N-02
  Route.get('/:id', 'Cowork/InvoicesController.show');
  Route.put('/:id', 'Cowork/InvoicesController.update');
  Route.delete('/:id', 'Cowork/InvoicesController.delete');
})
  .prefix('api/cowork/finance/invoices')
  .middleware(['auth', `coworkAuthorization:${CoworkModulesEnum.FINANCES}`]);
