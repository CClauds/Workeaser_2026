import Route from '@ioc:Adonis/Core/Route';
import { CoworkModulesEnum } from 'Contracts/enums';

Route.group(() => {
  Route.get('/unapproved', 'Cowork/BookingsAndAgendaController.unapproved');
  Route.get('/scheduled', 'Cowork/BookingsAndAgendaController.scheduled');
})
  .prefix('api/cowork/relationship/bookings')
  .middleware(['auth', `coworkAuthorization:${CoworkModulesEnum.RELATIONSHIP}`]);
