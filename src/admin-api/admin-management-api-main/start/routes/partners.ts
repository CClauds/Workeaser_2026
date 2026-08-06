import Route from '@ioc:Adonis/Core/Route'

/**
 * Partner management — only SYSTEM_DIRECTORs can create/update/delete other
 * partners. SYSTEM_MANAGERs can read the directory.
 */
Route.group(() => {
  Route.get('/', 'PartnersController.index')
  Route.get('/:id', 'PartnersController.show')
})
  .prefix('api/admin/partners')
  .middleware(['auth'])

Route.group(() => {
  Route.post('/', 'PartnersController.store')
  Route.put('/:id', 'PartnersController.update')
  Route.delete('/:id', 'PartnersController.destroy')
})
  .prefix('api/admin/partners')
  .middleware(['auth', 'adminRole:SYSTEM_DIRECTOR'])
