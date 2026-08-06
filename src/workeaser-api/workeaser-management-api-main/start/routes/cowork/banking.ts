import Route from '@ioc:Adonis/Core/Route';
import { CoworkModulesEnum } from 'Contracts/enums';

Route.group(() => {
  Route.get('/:id', 'Cowork/BankingController.list');
  Route.get('/:id/:transactionId', 'Cowork/BankingController.showTransaction');
  Route.put('/:id/:transactionId/record', 'Cowork/BankingController.recordTransaction');
  Route.put('/:id/:transactionId/void', 'Cowork/BankingController.voidTransaction');
  Route.put('/:id/:transactionId/note', 'Cowork/BankingController.addNote');
  Route.put('/:id/:transactionId/category', 'Cowork/BankingController.changeCategory');
  Route.post('/:id/sync', 'Cowork/BankingController.syncTransactions');
})
  .prefix('api/cowork/finance/banking')
  .middleware(['auth', `coworkAuthorization:${CoworkModulesEnum.FINANCES}`]);
