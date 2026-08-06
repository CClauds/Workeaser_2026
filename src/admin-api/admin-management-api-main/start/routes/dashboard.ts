import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('/dashboard', 'DashboardController.metrics')
})
  .prefix('api/admin')
  .middleware(['auth'])
