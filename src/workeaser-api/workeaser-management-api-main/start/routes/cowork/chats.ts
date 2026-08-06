import Route from '@ioc:Adonis/Core/Route';
import { CoworkModulesEnum } from 'Contracts/enums';

Route.group(() => {
  Route.get('/', 'Cowork/ChatController.index');
  Route.post('/', 'Cowork/ChatController.firstOrCreateChat');
  Route.get('/lastmessages', 'Cowork/ChatController.lastMessages');
  Route.get('/:uuid/messages', 'Cowork/ChatController.showChatMessages');
  Route.post('/:uuid/messages', 'Cowork/ChatController.newMessage');
})
  .prefix('api/cowork/chats')
  .middleware(['auth', `coworkAuthorization:${CoworkModulesEnum.RELATIONSHIP}`]);
