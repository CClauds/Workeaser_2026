import Route from '@ioc:Adonis/Core/Route';
import { CoworkModulesEnum } from 'Contracts/enums';

Route.group(() => {
  Route.get('/', 'Cowork/LocationsController.index');
  Route.get('/export', 'Cowork/LocationsController.export');
  Route.post('/', 'Cowork/LocationsController.store');
  Route.post('/import', 'Cowork/LocationsController.import');
  Route.get('/:id', 'Cowork/LocationsController.show');
  Route.put('/:id', 'Cowork/LocationsController.update');
  Route.delete('/:id', 'Cowork/LocationsController.delete');
})
  .prefix('api/cowork/locations')
  .middleware(['auth', `coworkAuthorization:${CoworkModulesEnum.LOCATIONS}`]);
