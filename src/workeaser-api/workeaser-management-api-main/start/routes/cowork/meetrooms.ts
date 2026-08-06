import Route from '@ioc:Adonis/Core/Route';
import { CoworkModulesEnum } from 'Contracts/enums';

Route.group(() => {
  Route.get('/', 'Cowork/MeetroomsController.index');
  Route.post('/', 'Cowork/MeetroomsController.store');
  Route.get('/export', 'Cowork/MeetroomsController.export');
  Route.get('/:id', 'Cowork/MeetroomsController.show');
  Route.put('/:id', 'Cowork/MeetroomsController.update');
  Route.delete('/:id', 'Cowork/MeetroomsController.destroy');
  Route.post('/:id/changeavailability', 'Cowork/MeetroomsController.changeSearchAvailability');
  Route.post('/book', 'Cowork/MeetroomsController.bookingMeeting');
  Route.get('/book/:id', 'Cowork/MeetroomsController.showMeeting');
  Route.post('/book/:id/approve', 'Cowork/MeetroomsController.bookingMeetingApprove');
  Route.post('/book/:id/reject', 'Cowork/MeetroomsController.bookingMeetingReject');
  Route.post('/import', 'Cowork/MeetroomsController.import');
})
  .prefix('api/cowork/meetrooms')
  .middleware(['auth', `coworkAuthorization:${CoworkModulesEnum.MEETROOM}`]);
