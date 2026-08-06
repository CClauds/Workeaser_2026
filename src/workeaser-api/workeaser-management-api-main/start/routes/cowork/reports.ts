import Route from '@ioc:Adonis/Core/Route';
import { CoworkModulesEnum } from 'Contracts/enums';

Route.group(() => {
  Route.get('/approvedbookings', 'Cowork/ReportsController.approvedBookings');
  Route.get('/contractrenewals', 'Cowork/ReportsController.contractRenewals');
  Route.get('/daypasseslisting', 'Cowork/ReportsController.dayPassesListing');
  Route.get('/invoicesoverview', 'Cowork/ReportsController.invoicesOverview');
  Route.get('/leadslisting', 'Cowork/ReportsController.leadsListing');
  Route.get('/memberslisting', 'Cowork/ReportsController.membersListing');
  Route.get(
    '/transactionhistory/:linkedBankAccountId',
    'Cowork/ReportsController.transactionHistory'
  );
  Route.get('/revenuebylocation', 'Cowork/ReportsController.revenueByLocation');
  Route.get('/revenuebymember', 'Cowork/ReportsController.revenueByMember');
  Route.get('/visitorslisting', 'Cowork/ReportsController.visitorsListing');
})
  .prefix('api/cowork/reports')
  .middleware(['auth', `coworkAuthorization:${CoworkModulesEnum.REPORTS}`]);
