import Route from '@ioc:Adonis/Core/Route';

Route.group(() => {
  Route.get('/', 'Client/ChatController.index');
  Route.post('/', 'Client/ChatController.firstOrCreateChat');

  Route.get('/lastmessages', 'Client/ChatController.lastMessages');

  Route.get('/:uuid/messages', 'Client/ChatController.showChatMessages');
  Route.post('/:uuid/messages', 'Client/ChatController.newMessage');
})
  .prefix('api/client/chats')
  .middleware(['auth', `clientAuthorization`]);
