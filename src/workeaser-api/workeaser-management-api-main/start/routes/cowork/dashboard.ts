import Route from '@ioc:Adonis/Core/Route';

Route.group(() => {
  Route.get('/', 'Cowork/DashboardController.mainDashboard');
  Route.get('/locations', 'Cowork/DashboardController.locationsDashboard');
  Route.get('/services', 'Cowork/DashboardController.servicesDashboard');
  Route.get('/relationship', 'Cowork/DashboardController.relationshipDashboard');
  Route.get('/finance', 'Cowork/DashboardController.financesDashboard');
})
  .prefix('api/cowork/dashboard')
  .middleware(['auth']);
