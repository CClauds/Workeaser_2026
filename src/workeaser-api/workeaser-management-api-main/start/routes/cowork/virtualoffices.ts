import Route from '@ioc:Adonis/Core/Route';
import { CoworkModulesEnum } from 'Contracts/enums';

Route.group(() => {
  Route.get('/', 'Cowork/VirtualOfficesController.index');
  Route.get('/export', 'Cowork/VirtualOfficesController.export');
  Route.get('/:id', 'Cowork/VirtualOfficesController.show');
  Route.post('/', 'Cowork/VirtualOfficesController.store');
  Route.put('/:id', 'Cowork/VirtualOfficesController.update');
  Route.delete('/:id', 'Cowork/VirtualOfficesController.destroy');
  Route.post('/:id/changeavailability', 'Cowork/VirtualOfficesController.changeSearchAvailability');
  Route.post('/import', 'Cowork/VirtualOfficesController.import');
})
  .prefix('api/cowork/virtualoffices')
  .middleware(['auth', `coworkAuthorization:${CoworkModulesEnum.VIRTUAL_OFFICE}`]);
