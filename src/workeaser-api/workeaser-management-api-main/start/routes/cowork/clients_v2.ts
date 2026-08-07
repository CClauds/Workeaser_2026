/**
 * B3-B: Client routes for operator panel (v2 schema).
 */
import Route from '@ioc:Adonis/Core/Route';

Route.group(() => {
  Route.get('/', 'Cowork/ClientsV2Controller.index');
  Route.post('/', 'Cowork/ClientsV2Controller.store');
  Route.get('/:id', 'Cowork/ClientsV2Controller.show');
  Route.put('/:id', 'Cowork/ClientsV2Controller.update');
  Route.delete('/:id', 'Cowork/ClientsV2Controller.destroy');
  Route.post('/:id/contracts', 'Cowork/ClientsV2Controller.addContract');
})
  .prefix('api/cowork/v2/clients')
  .middleware(['auth', 'coworkRole']);
