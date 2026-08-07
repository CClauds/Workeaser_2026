/**
 * B3-C: Setup routes for operator panel (B2 tables).
 */
import Route from '@ioc:Adonis/Core/Route';

Route.group(() => {
  // Locations (read existing)
  Route.get('locations', 'Cowork/SetupController.locations');

  // Rooms Units CRUD
  Route.get('rooms', 'Cowork/SetupController.roomsIndex');
  Route.post('rooms', 'Cowork/SetupController.roomsStore');
  Route.put('rooms/:id', 'Cowork/SetupController.roomsUpdate');
  Route.delete('rooms/:id', 'Cowork/SetupController.roomsDestroy');

  // Resellers CRUD
  Route.get('resellers', 'Cowork/SetupController.resellersIndex');
  Route.post('resellers', 'Cowork/SetupController.resellersStore');
  Route.put('resellers/:id', 'Cowork/SetupController.resellersUpdate');
  Route.delete('resellers/:id', 'Cowork/SetupController.resellersDestroy');

  // Service types (read-only)
  Route.get('service-types', 'Cowork/SetupController.serviceTypes');

  // Users (read + create)
  Route.get('users', 'Cowork/SetupController.usersIndex');
})
  .prefix('api/cowork/v2/setup')
  .middleware(['auth', 'coworkRole']);
