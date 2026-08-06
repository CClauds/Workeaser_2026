import Route from '@ioc:Adonis/Core/Route';
import { CoworkModulesEnum } from 'Contracts/enums';

Route.group(() => {
  Route.get('/', 'Cowork/MailboxesController.index');
  Route.post('/', 'Cowork/MailboxesController.store');
  Route.get('/:id', 'Cowork/MailboxesController.show');
  Route.put('/:id', 'Cowork/MailboxesController.update');
})
  .prefix('api/cowork/relationship/mailbox')
  .middleware(['auth', `coworkAuthorization:${CoworkModulesEnum.RELATIONSHIP}`]);
