import Event from '@ioc:Adonis/Core/Event';

Event.on('user:new', 'User.onNewUser');
