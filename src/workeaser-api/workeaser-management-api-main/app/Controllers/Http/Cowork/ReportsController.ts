import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import ApprovedBookingsService from 'App/Services/Cowork/Reports/ApprovedBookingsService';
import ContractRenewalsService from 'App/Services/Cowork/Reports/ContractRenewalsService';
import DayPassesService from 'App/Services/Cowork/Reports/DayPassesService';
import InvoicesOverviewService from 'App/Services/Cowork/Reports/InvoicesOverviewService';
import LeadsListingService from 'App/Services/Cowork/Reports/LeadsListingService';
import MembersListingService from 'App/Services/Cowork/Reports/MembersListingService';
import RevenueByLocationService from 'App/Services/Cowork/Reports/RevenueByLocationService';
import RevenueByMemberService from 'App/Services/Cowork/Reports/RevenueByMemberService';
import TransactionHistoryService from 'App/Services/Cowork/Reports/TransactionHistoryService';
import VisitorsListingService from 'App/Services/Cowork/Reports/VisitorsListingService';
import AppError from 'App/Utils/AppError';
import { responseWithError } from 'App/Utils/ResponseApi';

const XLSX_MIME =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

function sendXlsx(response: any, report: any, filename: string) {
  // `report` is Buffer | Uint8Array | any (depends on the xlsx lib used per
  // service). Normalize to a plain Buffer at the boundary.
  const buffer = Buffer.isBuffer(report) ? report : Buffer.from(report as Uint8Array);
  response.header('content-type', XLSX_MIME);
  response.header('content-length', buffer.length.toString());
  response.header(
    'content-disposition',
    `attachment; filename="${filename.replace(/"/g, '')}.xlsx"`
  );
  response.send(buffer);
  return response;
}

export default class ReportsController {
  async approvedBookings({ request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const filters = request.all();
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      await user.load('coworkUser');
      const report = await ApprovedBookingsService.generate(
        user.coworkUser.coworkAccountId,
        filters
      );

      return sendXlsx(response, report, 'approved-bookings');
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async contractRenewals({ request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const filters = request.all();
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      await user.load('coworkUser');
      const report = await ContractRenewalsService.generate(
        user.coworkUser.coworkAccountId,
        filters
      );

      return sendXlsx(response, report, 'contract-renewals');
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async dayPassesListing({ request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const filters = request.all();
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      await user.load('coworkUser');
      const report = await DayPassesService.generate(user.coworkUser.coworkAccountId, filters);

      return sendXlsx(response, report, 'day-passes-listing');
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async invoicesOverview({ request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const filters = request.all();
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      await user.load('coworkUser');
      const report = await InvoicesOverviewService.generate(
        user.coworkUser.coworkAccountId,
        filters
      );

      return sendXlsx(response, report, 'invoices-overview');
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async leadsListing({ request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const filters = request.all();
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      await user.load('coworkUser');
      const report = await LeadsListingService.generate(user.coworkUser.coworkAccountId, filters);

      return sendXlsx(response, report, 'leads-listing');
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async membersListing({ request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const filters = request.all();
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      await user.load('coworkUser');
      const report = await MembersListingService.generate(user.coworkUser.coworkAccountId, filters);

      return sendXlsx(response, report, 'members-listing');
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async revenueByLocation({ request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const filters = request.all();
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      await user.load('coworkUser');
      const report = await RevenueByLocationService.generate(
        user.coworkUser.coworkAccountId,
        filters
      );

      return sendXlsx(response, report, 'revenue-by-location');
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async revenueByMember({ request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const filters = request.all();
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      await user.load('coworkUser');
      const report = await RevenueByMemberService.generate(
        user.coworkUser.coworkAccountId,
        filters
      );

      return sendXlsx(response, report, 'revenue-by-member');
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async visitorsListing({ request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const filters = request.all();
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      await user.load('coworkUser');
      const report = await VisitorsListingService.generate(
        user.coworkUser.coworkAccountId,
        filters
      );

      return sendXlsx(response, report, 'visitors-listing');
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async transactionHistory({ params, request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const filters = request.all();
      const user = auth.user;
      const linkedBankAccountId = params.linkedBankAccountId;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      await user.load('coworkUser');
      const report = await TransactionHistoryService.generate(
        user.coworkUser.coworkAccountId,
        linkedBankAccountId,
        filters
      );

      return sendXlsx(response, report, 'transaction-history');
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }
}
