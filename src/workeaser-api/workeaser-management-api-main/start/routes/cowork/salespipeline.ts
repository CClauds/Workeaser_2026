import Route from '@ioc:Adonis/Core/Route';
import { CoworkModulesEnum } from 'Contracts/enums';

Route.group(() => {
  Route.get('/', 'Cowork/SalesPipelineController.index');
  Route.post('/', 'Cowork/SalesPipelineController.store');
  Route.put('/:id', 'Cowork/SalesPipelineController.update');
  Route.post('/:id/status', 'Cowork/SalesPipelineController.updateStatus');
})
  .prefix('api/cowork/relationship/salespipeline')
  .middleware(['auth', `coworkAuthorization:${CoworkModulesEnum.RELATIONSHIP}`]);
