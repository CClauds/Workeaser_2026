import Route from '@ioc:Adonis/Core/Route';
import { CoworkModulesEnum } from 'Contracts/enums';

Route.group(() => {
  Route.get('/', 'Cowork/ContractsController.index');
  Route.post('/', 'Cowork/ContractsController.store');
  Route.get('/:id', 'Cowork/ContractsController.show');
  Route.get('/:id/pdf', 'Cowork/ContractsController.getContractPdf');
  Route.delete('/:id', 'Cowork/ContractsController.detach');
  Route.put('/:id/attachdocuments', 'Cowork/ContractsController.attachNewDocuments');
  Route.get('/getopencontracts/:userId', 'Cowork/ContractsController.getContracts');
  Route.get('/getcancelinfo/:contractId', 'Cowork/ContractsController.getContractCancelInfo');
  Route.post('/:id/sendcontract', 'Cowork/ContractsController.sendContract');
  Route.post('/calculate', 'Cowork/ContractsController.calculateService');
  Route.get('/:id/url', 'Cowork/ContractsController.contractUrlCowork');
  Route.get('/:id/status', 'Cowork/ContractsController.getContractStatus');
})
  .prefix('api/cowork/relationship/contracts')
  .middleware(['auth', `coworkAuthorization:${CoworkModulesEnum.RELATIONSHIP}`]);
