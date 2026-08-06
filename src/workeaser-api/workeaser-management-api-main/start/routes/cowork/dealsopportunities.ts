import Route from '@ioc:Adonis/Core/Route';
import { CoworkModulesEnum } from 'Contracts/enums';

Route.group(() => {
  // to do Route.get coworking deal by id
  Route.get('/', 'Cowork/DealsOpportunitiesController.index');
  Route.get('/:id', 'Cowork/DealsOpportunitiesController.show');
  Route.post('/:id/approve', 'Cowork/DealsOpportunitiesController.approve');
  Route.post('/:id/reject', 'Cowork/DealsOpportunitiesController.reject');
})
  .prefix('api/cowork/relationship/dealsopportunities')
  .middleware(['auth', `coworkAuthorization:${CoworkModulesEnum.RELATIONSHIP}`]);
