import Route from '@ioc:Adonis/Core/Route'

/**
 * Customer-facing read endpoints: list/inspect coworking and client accounts.
 * Both director and manager roles can use these.
 */
Route.group(() => {
  Route.get('/coworkings', 'ClientsController.listCoworkings')
  Route.get('/coworkings/:id', 'ClientsController.showCoworking')
  Route.get('/clients', 'ClientsController.listClients')
  Route.get('/clients/:id', 'ClientsController.showClient')
})
  .prefix('api/admin')
  .middleware(['auth'])

/**
 * Destructive moderation: suspend / unsuspend users. Only directors.
 */
Route.group(() => {
  Route.post('/users/:userId/suspend', 'ClientsController.suspendUser')
  Route.post('/users/:userId/unsuspend', 'ClientsController.unsuspendUser')
})
  .prefix('api/admin')
  .middleware(['auth', 'adminRole:SYSTEM_DIRECTOR'])
