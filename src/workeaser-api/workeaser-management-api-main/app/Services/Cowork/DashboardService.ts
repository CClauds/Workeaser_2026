import Database from '@ioc:Adonis/Lucid/Database';
import Logger from '@ioc:Adonis/Core/Logger';
import BankAccountTransaction from 'App/Models/BankAccountTransaction';
import ClientAccount from 'App/Models/ClientAccount';
import Contract from 'App/Models/Contract';
import ContractRenewal from 'App/Models/ContractRenewal';
import ContractUsage from 'App/Models/ContractUsage';
import CoworkClient from 'App/Models/CoworkClient';
import DayPass from 'App/Models/DayPass';
import Desk from 'App/Models/Desk';
import Invoice from 'App/Models/Invoice';
import InvoiceItem from 'App/Models/InvoiceItem';
import Lead from 'App/Models/Lead';
import LeadOpportunity from 'App/Models/LeadOpportunity';
import Location from 'App/Models/Location';
import Mailbox from 'App/Models/Mailbox';
import MeetRoom from 'App/Models/Meetroom';
import Room from 'App/Models/Room';
import Tour from 'App/Models/Tour';
import User from 'App/Models/User';
import VirtualOffice from 'App/Models/VirtualOffice';
import AppError from 'App/Utils/AppError';
import {
  ContractStatusEnum,
  DayPassStatusEnum,
  InvoiceStatusEnum,
  LeadStatusEnum,
  MailboxClientEnum,
  PaymentStatusEnum,
  ServicesEnum,
  ToursStatusEnum,
  TransactionStatus
} from 'Contracts/enums';
import { groupBy } from 'lodash';
import { DateTime } from 'luxon';

interface MainDashboardResponse {
  active_locations: number;
  open_opportunities: number;
  active_members: number;
  receivable_income: number;
  total_occupancy: number;
  sales_pipeline: SalesPipelineInterface;
  clients_per_category: ClientsPerCategoryInterface;
  invoice_per_status: InvoicesPerStatusInterface;
  upcoming_bookings: UpcomingBookingsInterface[];
  mailbox_requests: MailboxRequestsInterface[];
}

interface LocationsDashboardResponse {
  spaces_occupancy: SpaceOccupancyDateInterface[];
  units_location: InfoLocationInterface[];
  total_occupancy: number;
}

interface ServicesDashboardResponse {
  clients_per_category: ClientsPerCategoryInterface;
  virtual_office_plans: InvoicesPerStatusInterface;
  desk_occupancy: number;
  private_rooms_occupancy: number;
  upcoming_bookings: UpcomingBookingsInterface[];
  upcoming_renewals: UpcomingRenewalsInterface[];
}

interface RelationshipDashboardResponse {
  open_opportunities: number;
  active_members: number;
  lifetime_value: number;
  average_revenue: number;
  sales_pipeline: SalesPipelineInterface;
  clients_per_category: ClientsPerCategoryInterface;
  average_value_per_category: AvgValuePerCategoryInterface;
  benefits_usage: number;
  users_location: InfoLocationInterface[];
  contracts_attention: ContractsAttentionsInterface;
  mailbox_actions: MailboxActionsInterface;
}

interface FinancesDashboardResponse {
  cashflow: CashFlowInterface[];
  income_per_product_category: IncomePerProductCategoryInterface;
  open_invoices_per_status: OpenInvoicePerStatusInterface;
  expenses_per_product_category: ExpensesPerProductCategoryInterface;
}

interface CashFlowInterface {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

interface ExpensesPerProductCategoryInterface {
  [key: string]: number;
}

interface OpenInvoicePerStatusInterface {
  open: number;
  partly_paid: number;
  overdue: number;
}

interface UpcomingBookingsInterface {
  id: number;
  reservation_type: string;
  name: string;
  datetime: DateTime;
  user_type: string;
}

interface MailboxRequestsInterface {
  id: number;
  activity_type: string;
  name: string;
  request: string;
}

interface UpcomingRenewalsInterface {
  id: number;
  name: string;
  date: DateTime;
  action: string;
}

interface ContractsAttentionsInterface {
  auto_renewal: number;
  cancelation: number;
}

interface MailboxActionsInterface {
  picking_up: number;
  hold: number;
  forward: number;
  trash: number;
}

interface InfoLocationInterface {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
}

interface SalesPipelineInterface {
  opportunity: number;
  contacted: number;
  requested: number;
  quoted: number;
  converted: number;
}

interface ClientsPerCategoryInterface {
  virtual_office: number;
  meeting_room: number;
  open_desk: number;
  private_room: number;
}

interface AvgValuePerCategoryInterface {
  [key: string]: number;
}

interface IncomePerProductCategoryInterface {
  [key: string]: number;
}

interface InvoicesPerStatusInterface {
  [key: string]: number;
}

interface SpaceOccupancyDateInterface {
  month: number;
  year: number;
  total?: number;
  totalDesk?: number;
  totalRoom?: number;
  totalMeetRoom?: number;
  open_desk: number;
  private_room: number;
  meet_room: number;
}

export default class DashboardService {
  /**
   * Run independent dashboard queries in parallel; log + degrade gracefully if any one fails
   * so a single broken metric does not produce a 500 with the whole payload missing.
   */
  private static async resolveOrDefault<T>(
    key: string,
    promise: Promise<T>,
    fallback: T
  ): Promise<T> {
    try {
      return await promise;
    } catch (err) {
      Logger.error({ err, key }, 'Dashboard metric failed; falling back to default value');
      return fallback;
    }
  }

  /**
   * Dashboards
   */
  static async mainDashboard(user: User): Promise<MainDashboardResponse> {
    await user.load('coworkUser');

    if (!user.coworkUser) {
      throw new AppError(AppError.INVALID_COWORK, "Don't found cowork account");
    }

    const coworkAccountId = user.coworkUser.coworkAccountId;
    const empty = (): any => 0;

    const [
      active_locations,
      open_opportunities,
      active_members,
      receivable_income,
      total_occupancy,
      sales_pipeline,
      clients_per_category,
      invoice_per_status,
      upcoming_bookings,
      mailbox_requests
    ] = await Promise.all([
      this.resolveOrDefault('active_locations', this.calcActiveLocations(coworkAccountId), empty()),
      this.resolveOrDefault(
        'open_opportunities',
        this.calcOpenOpportunities(coworkAccountId),
        empty()
      ),
      this.resolveOrDefault('active_members', this.calcActiveMembers(coworkAccountId), empty()),
      this.resolveOrDefault(
        'receivable_income',
        this.calcReceivableIncome(coworkAccountId),
        empty()
      ),
      this.resolveOrDefault('total_occupancy', this.calcTotalOccupancy(coworkAccountId), empty()),
      this.resolveOrDefault(
        'sales_pipeline',
        this.getSalesPipeline(coworkAccountId),
        { opportunity: 0, contacted: 0, requested: 0, quoted: 0, converted: 0 }
      ),
      this.resolveOrDefault(
        'clients_per_category',
        this.getClientsProductCategory(coworkAccountId),
        { virtual_office: 0, meeting_room: 0, open_desk: 0, private_room: 0 }
      ),
      this.resolveOrDefault(
        'invoice_per_status',
        this.getInvoicesPerStatus(coworkAccountId),
        {}
      ),
      this.resolveOrDefault('upcoming_bookings', this.getUpcomingBookings(coworkAccountId), []),
      this.resolveOrDefault('mailbox_requests', this.getMailboxRequests(coworkAccountId), [])
    ]);

    return {
      active_locations,
      open_opportunities,
      active_members,
      receivable_income,
      total_occupancy,
      sales_pipeline,
      clients_per_category,
      invoice_per_status,
      upcoming_bookings,
      mailbox_requests
    };
  }

  static async locationsDashboard(user: User): Promise<LocationsDashboardResponse> {
    await user.load('coworkUser');
    const coworkAccountId = user.coworkUser.coworkAccountId;

    return {
      spaces_occupancy: await this.calcSpacesOccupancy(coworkAccountId),
      units_location: await this.getUnitsLocation(coworkAccountId),
      total_occupancy: await this.calcTotalOccupancy(coworkAccountId)
    };
  }

  static async servicesDashboard(user: User): Promise<ServicesDashboardResponse> {
    await user.load('coworkUser');
    const coworkAccountId = user.coworkUser.coworkAccountId;

    return {
      clients_per_category: await this.getClientsProductCategory(coworkAccountId),
      virtual_office_plans: await this.getInvoicesVirtualOfficePerStatus(coworkAccountId),
      desk_occupancy: await this.calcDeskOccupancy(coworkAccountId),
      private_rooms_occupancy: await this.calcPrivateRoomsOccupancy(coworkAccountId),
      upcoming_bookings: await this.getUpcomingBookings(coworkAccountId),
      upcoming_renewals: await this.getUpcomingContracts(coworkAccountId)
    };
  }

  static async relationshipDashboard(user: User): Promise<RelationshipDashboardResponse> {
    await user.load('coworkUser');

    if (!user.coworkUser) {
      throw new AppError(AppError.INVALID_COWORK, "Don't found cowork account");
    }

    const coworkAccountId = user.coworkUser.coworkAccountId;

    const [
      open_opportunities,
      active_members,
      lifetime_value,
      average_revenue,
      sales_pipeline,
      clients_per_category,
      average_value_per_category,
      benefits_usage,
      users_location,
      contracts_attention,
      mailbox_actions
    ] = await Promise.all([
      this.resolveOrDefault('open_opportunities', this.calcOpenOpportunities(coworkAccountId), 0),
      this.resolveOrDefault('active_members', this.calcActiveMembers(coworkAccountId), 0),
      this.resolveOrDefault('lifetime_value', this.calcLifetimeValue(coworkAccountId), 0),
      this.resolveOrDefault('average_revenue', this.calcAverageRevenue(coworkAccountId), 0),
      this.resolveOrDefault('sales_pipeline', this.getSalesPipeline(coworkAccountId), {
        opportunity: 0,
        contacted: 0,
        requested: 0,
        quoted: 0,
        converted: 0
      }),
      this.resolveOrDefault('clients_per_category', this.getClientsProductCategory(coworkAccountId), {
        virtual_office: 0,
        meeting_room: 0,
        open_desk: 0,
        private_room: 0
      }),
      this.resolveOrDefault(
        'average_value_per_category',
        this.getAvgValueProductCategory(coworkAccountId),
        {}
      ),
      this.resolveOrDefault('benefits_usage', this.calcBenefitsUsageCycle(coworkAccountId), 0),
      this.resolveOrDefault('users_location', this.getLeadsMembersLocation(coworkAccountId), []),
      this.resolveOrDefault('contracts_attention', this.calcContractsAttention(coworkAccountId), {
        auto_renewal: 0,
        cancelation: 0
      }),
      this.resolveOrDefault('mailbox_actions', this.getMailboxOverview(coworkAccountId), {
        picking_up: 0,
        hold: 0,
        forward: 0,
        trash: 0
      })
    ]);

    return {
      open_opportunities,
      active_members,
      lifetime_value,
      average_revenue,
      sales_pipeline,
      clients_per_category,
      average_value_per_category,
      benefits_usage,
      users_location,
      contracts_attention,
      mailbox_actions
    };
  }

  static async financesDashboard(user: User): Promise<FinancesDashboardResponse> {
    await user.load('coworkUser');
    const coworkAccountId = user.coworkUser.coworkAccountId;

    return {
      cashflow: await this.getCashflow(coworkAccountId),
      income_per_product_category: await this.getDivisionIncomeProductCategory(coworkAccountId),
      open_invoices_per_status: await this.getOpenInvoicesPerStatus(coworkAccountId),
      expenses_per_product_category: await this.getExpensesProductCategory(coworkAccountId)
    };
  }

  /**
   * Get database infos and calculate metrics
   */
  private static async getCashflow(coworkAccountId: number): Promise<CashFlowInterface[]> {
    const transactions = await BankAccountTransaction.query()
      .select(Database.raw("CONCAT(MONTH(date), '/', YEAR(date)) as month, spent, received"))
      .whereHas('linkedBankAccount', (accountQuery) => {
        accountQuery.where('cowork_account_id', coworkAccountId);
      })
      .where('status', TransactionStatus.RECORDED)
      .whereRaw('date >= NOW() - INTERVAL 12 month');

    const balance: { [key: string]: { spent: number; received: number } }[] = [];

    for (const t of transactions) {
      if (Object.keys(balance).includes(t.$extras.month)) {
        balance[t.$extras.month].spent += t.spent || 0;
        balance[t.$extras.month].received += t.received || 0;
      } else {
        balance[t.$extras.month] = {
          spent: t.spent || 0,
          received: t.received || 0
        };
      }
    }

    const result: CashFlowInterface[] = [];

    Object.keys(balance).forEach((month) => {
      result.push({
        month: month,
        income: Math.round(balance[month].received) || 0,
        expense: Math.round(balance[month].spent) || 0,
        balance: Math.round(balance[month].received - balance[month].spent) || 0
      });
    });

    return result;
  }

  private static async getDivisionIncomeProductCategory(
    coworkAccountId: number
  ): Promise<IncomePerProductCategoryInterface> {
    const incomes = await BankAccountTransaction.query()
      .select('category')
      .sum('received', 'total')
      .whereHas('linkedBankAccount', (accountQuery) => {
        accountQuery.where('cowork_account_id', coworkAccountId);
      })
      .where('status', TransactionStatus.RECORDED)
      .whereNotNull('received')
      .whereNotNull('category')
      .groupBy('category');

    const result: IncomePerProductCategoryInterface = {};

    incomes.forEach((income) => {
      result[income.category] = income.$extras.total;
    });

    return result;
  }

  private static async getOpenInvoicesPerStatus(
    coworkAccountId: number
  ): Promise<OpenInvoicePerStatusInterface> {
    const invoices: Invoice[] = await Invoice.query()
      .where('cowork_account_id', coworkAccountId)
      .whereIn('status', [
        InvoiceStatusEnum.SENT,
        InvoiceStatusEnum.VIEWED,
        InvoiceStatusEnum.PARTLY_PAID
      ]);

    const result: OpenInvoicePerStatusInterface = {
      open: 0,
      partly_paid: 0,
      overdue: 0
    };

    for (const invoice of invoices) {
      if (
        invoice.status === InvoiceStatusEnum.SENT ||
        invoice.status === InvoiceStatusEnum.VIEWED
      ) {
        const isOverdue = await invoice.isOverdue();

        if (isOverdue) {
          result.overdue += 1;
        } else {
          result.open += 1;
        }
      }

      if (invoice.status === InvoiceStatusEnum.PARTLY_PAID) {
        result.partly_paid += 1;
      }
    }

    return result;
  }

  private static async getExpensesProductCategory(
    coworkAccountId: number
  ): Promise<IncomePerProductCategoryInterface> {
    const expenses = await BankAccountTransaction.query()
      .select('category')
      .sum('spent', 'total')
      .whereHas('linkedBankAccount', (accountQuery) => {
        accountQuery.where('cowork_account_id', coworkAccountId);
      })
      .where('status', TransactionStatus.RECORDED)
      .whereNotNull('spent')
      .whereNotNull('category')
      .groupBy('category');

    const result: IncomePerProductCategoryInterface = {};

    expenses.forEach((expense) => {
      result[expense.category] = expense.$extras.total;
    });

    return result;
  }

  private static async getAvgValueProductCategory(
    coworkAccountId: number
  ): Promise<AvgValuePerCategoryInterface> {
    const result: AvgValuePerCategoryInterface = {};

    const invoiceItemsAvg = await InvoiceItem.query()
      .select(Database.raw('service_type, AVG(total_amount) as avg'))
      .whereIn('service_type', [
        ServicesEnum.MEETING_ROOM,
        ServicesEnum.OPEN_DESK,
        ServicesEnum.PRIVATE_ROOM,
        ServicesEnum.VIRTUAL_OFFICE
      ])
      .whereHas('invoice', (invoiceQuery) => {
        invoiceQuery.where('cowork_account_id', coworkAccountId);
      })
      .groupBy('service_type');

    invoiceItemsAvg.forEach((service) => {
      result[service.serviceType] = Math.round(service.$extras.avg) || 0;
    });

    return result;
  }

  private static async calcAverageRevenue(coworkAccountId: number): Promise<number> {
    try {
      const avgPerMonth = await Invoice.query()
        .select(Database.raw("CONCAT(YEAR(date), '-', MONTH(date)) as ym, AVG(total) as avg"))
        .where('cowork_account_id', coworkAccountId)
        .groupBy('user_id');

      if (avgPerMonth.length) {
        return (
          Math.round(avgPerMonth.reduce((a, c) => (a += c.$extras.avg), 0) / avgPerMonth.length) ||
          0
        );
      }

      return 0;
    } catch (error) {
      throw error;
    }
  }

  private static async calcLifetimeValue(coworkAccountId: number): Promise<number> {
    const contracts = await Contract.query()
      .select('user_id')
      .sum('amount', 'total')
      .whereIn('status', [ContractStatusEnum.ACTIVE, ContractStatusEnum.INACTIVE])
      .where('cowork_account_id', coworkAccountId)
      .groupBy('user_id');

    if (contracts.length) {
      return (
        Math.round(contracts.reduce((a, c) => (a += c.$extras.total), 0) / contracts.length) || 0
      );
    }

    return 0;
  }

  private static async getUpcomingContracts(
    coworkAccountId: number
  ): Promise<UpcomingRenewalsInterface[]> {
    let results: UpcomingRenewalsInterface[] = [];

    const contracts: Contract[] = await Contract.query()
      .preload('user')
      .where('cowork_account_id', coworkAccountId)
      .where('status', ContractStatusEnum.ACTIVE)
      .whereRaw('DATE(date_end) >= DATE(NOW())')
      .whereHas('user', (userQuery) => {
        userQuery.whereNull('deleted_at');
      })
      .orderBy('date_end', 'ASC')
      .limit(24);

    for (const contract of contracts) {
      const action = contract.autoRenewal ? 'RENEWAL' : 'CANCELATION';

      results.push({
        id: contract.id,
        name: contract.user.fullName,
        action: action,
        date: contract.dateEnd
      });
    }

    return results;
  }

  private static async getUpcomingBookings(
    coworkAccountId: number
  ): Promise<UpcomingBookingsInterface[]> {
    let result: UpcomingBookingsInterface[] = [];

    // Day Passes
    const dayPasses = await DayPass.query()
      .where('status', DayPassStatusEnum.APPROVED)
      .whereRaw('date >= DATE(NOW())')
      .whereHas('location', (locationQuery) => {
        locationQuery.where('cowork_account_id', coworkAccountId);
        locationQuery.whereNull('deleted_at');
      });

    // Tours
    const tours = await Tour.query()
      .preload('location')
      .whereHas('location', (locationQuery) => {
        locationQuery.where('cowork_account_id', coworkAccountId);
        locationQuery.whereNull('deleted_at');
      })
      .where('status', ToursStatusEnum.APPROVED);

    for (const dayPass of dayPasses) {
      const name = await this.getServiceName(dayPass.space, dayPass.resourceId);
      result.push({
        id: dayPass.id,
        reservation_type: dayPass.space,
        name: name,
        datetime: dayPass.date,
        user_type: dayPass.userType
      });
    }

    for (const tour of tours) {
      result.push({
        id: tour.id,
        reservation_type: 'TOUR',
        name: tour.location.name,
        datetime: tour.dateStart,
        user_type: 'LEAD'
      });
    }

    result = result.sort((a, b) => {
      return b.datetime.toMillis() - a.datetime.toMillis();
    });

    // Limit to 24 results
    result = result.slice(0, 24);

    return result;
  }

  private static async getServiceName(serviceType: string, resourceId: number): Promise<string> {
    switch (serviceType) {
      case ServicesEnum.VIRTUAL_OFFICE:
        const virtualOffice = await VirtualOffice.find(resourceId);

        if (!virtualOffice) {
          return '';
        }

        return virtualOffice.name;
      case ServicesEnum.OPEN_DESK:
        const desk = await Desk.find(resourceId);

        if (!desk) {
          return '';
        }

        return desk.name;
      case ServicesEnum.PRIVATE_ROOM:
        const room = await Room.find(resourceId);

        if (!room) {
          return '';
        }

        return room.name;
    }

    return '';
  }

  private static async getMailboxRequests(
    coworkAccountId: number
  ): Promise<MailboxRequestsInterface[]> {
    let result: MailboxRequestsInterface[] = [];

    const mailboxes = await Mailbox.query()
      .preload('clientAccount', (clientAccountQuery) => {
        clientAccountQuery.preload('user');
      })
      .whereHas('clientAccount', (clientAccountQuery) => {
        clientAccountQuery.whereNull('deleted_at');
        clientAccountQuery.whereHas('user', (userQuery) => {
          userQuery.whereNull('deleted_at');
        });
      })
      .whereHas('location', (locationQuery) => {
        locationQuery.where('cowork_account_id', coworkAccountId);
        locationQuery.whereNull('deleted_at');
      })
      .orderBy('created_at', 'desc')
      .limit(24);

    for (const mailbox of mailboxes) {
      result.push({
        id: mailbox.id,
        name: mailbox.clientAccount.user.fullName,
        activity_type: 'MAILBOX',
        request: mailbox.requestedAction
      });
    }

    return result;
  }

  private static async calcActiveLocations(coworkAccountId: number): Promise<number> {
    const locations = await Database.from('locations')
      .where('cowork_account_id', coworkAccountId)
      .whereNull('deleted_at')
      .count('*', 'total');

    return locations[0].total;
  }

  private static async calcOpenOpportunities(coworkAccountId: number): Promise<number> {
    const opportunities = await Database.from('lead_opportunities')
      .innerJoin('leads', (query) => {
        query
          .on('lead_opportunities.lead_id', 'leads.id')
          .andOnNull('leads.deleted_at')
          .andOnVal('leads.cowork_account_id', coworkAccountId);
      })
      .where('status', LeadStatusEnum.OPPORTUNITY)
      .count('*', 'total');

    return opportunities[0].total;
  }

  private static async calcActiveMembers(coworkAccountId: number): Promise<number> {
    const members = await Database.from('cowork_clients')
      .where('cowork_account_id', coworkAccountId)
      .innerJoin('users', (query) => {
        query.on('cowork_clients.user_id', 'users.id').andOnNull('users.deleted_at');
      })
      .count('*', 'total');

    return members[0].total;
  }

  private static async calcReceivableIncome(coworkAccountId: number): Promise<number> {
    const invoices = await Invoice.query()
      .where('cowork_account_id', coworkAccountId)
      .whereNotIn('status', [InvoiceStatusEnum.DEPOSITED, InvoiceStatusEnum.FULLY_PAID])
      .preload('payments', (paymentsQuery) => {
        paymentsQuery.whereNotIn('status', [PaymentStatusEnum.REFUNDED, PaymentStatusEnum.FAILED]);
      });

    let total = 0;

    for (const invoice of invoices) {
      let sumPayments = invoice.payments.reduce((acc, curr) => acc + curr.available, 0);
      total += invoice.getInvoiceTotal - sumPayments;
    }

    return total;
  }

  private static async calcTotalOccupancy(coworkAccountId: number): Promise<number> {
    const rooms = await Room.query()
      .sum('room_capacity', 'total')
      .whereHas('location', (query) => {
        query.where('cowork_account_id', coworkAccountId);
      });

    const desks = await Desk.query()
      .sum('quantity', 'total')
      .whereHas('location', (query) => {
        query.where('cowork_account_id', coworkAccountId);
      });

    const contracts = await Contract.query()
      .where('cowork_account_id', coworkAccountId)
      .where('status', ContractStatusEnum.ACTIVE)
      .whereIn('service_type', [ServicesEnum.OPEN_DESK, ServicesEnum.PRIVATE_ROOM])
      .count('*', 'total');

    const totalRooms = rooms[0].$extras.total;
    const totalDesks = desks[0].$extras.total;
    const totalContracts = contracts[0].$extras.total;

    // If has more contracts than rooms and desks vacancies
    const totalVacancies =
      totalRooms + totalDesks > totalContracts ? totalRooms + totalDesks : totalContracts;

    return Math.round((totalContracts * 100) / totalVacancies) || 0;
  }

  private static async calcSpacesOccupancy(
    coworkAccountId: number
  ): Promise<SpaceOccupancyDateInterface[]> {
    const rooms = await Room.query()
      .sum('room_capacity', 'total')
      .whereHas('location', (query) => {
        query.where('cowork_account_id', coworkAccountId);
      });

    const desks = await Desk.query()
      .sum('quantity', 'total')
      .whereHas('location', (query) => {
        query.where('cowork_account_id', coworkAccountId);
      });

    const meetRoom = await MeetRoom.query()
      .sum('measure_occupancy', 'total')
      .whereHas('location', (query) => {
        query.where('cowork_account_id', coworkAccountId);
      });

    const dates: SpaceOccupancyDateInterface[] = [];
    for (let i = 0; i < 12; i++) {
      const date = DateTime.now().minus({ months: i });

      dates.push({
        month: date.month,
        year: date.year,
        total: 0,
        totalDesk: 0,
        totalRoom: 0,
        totalMeetRoom: 0,
        open_desk: 0,
        private_room: 0,
        meet_room: 0
      });
    }

    for (const date of dates) {
      const contractsDesk = await ContractRenewal.query()
        .whereHas('contract', (contractQuery) => {
          contractQuery.where('cowork_account_id', coworkAccountId);
          contractQuery.where('service_type', ServicesEnum.OPEN_DESK);
        })
        .where((query) => {
          query.whereRaw(
            "STR_TO_DATE(CONCAT(?, '-', ?), '%Y-%m') BETWEEN STR_TO_DATE(CONCAT(YEAR(date_start), '-', MONTH(date_start)), '%Y-%m') AND STR_TO_DATE(CONCAT(YEAR(date_end), '-', MONTH(date_end)), '%Y-%m')",
            [date.year, date.month]
          );
        })
        .count('*', 'total');

      const contractsRoom = await ContractRenewal.query()
        .whereHas('contract', (contractQuery) => {
          contractQuery.where('cowork_account_id', coworkAccountId);
          contractQuery.where('service_type', ServicesEnum.PRIVATE_ROOM);
        })
        .where((query) => {
          query.whereRaw(
            "STR_TO_DATE(CONCAT(?, '-', ?), '%Y-%m') BETWEEN STR_TO_DATE(CONCAT(YEAR(date_start), '-', MONTH(date_start)), '%Y-%m') AND STR_TO_DATE(CONCAT(YEAR(date_end), '-', MONTH(date_end)), '%Y-%m')",
            [date.year, date.month]
          );
        })
        .count('*', 'total');

      const contractsMeetRoom = await ContractRenewal.query()
        .whereHas('contract', (contractQuery) => {
          contractQuery.where('cowork_account_id', coworkAccountId);
          contractQuery.where('service_type', ServicesEnum.MEETING_ROOM);
        })
        .where((query) => {
          query.whereRaw(
            "STR_TO_DATE(CONCAT(?, '-', ?), '%Y-%m') BETWEEN STR_TO_DATE(CONCAT(YEAR(date_start), '-', MONTH(date_start)), '%Y-%m') AND STR_TO_DATE(CONCAT(YEAR(date_end), '-', MONTH(date_end)), '%Y-%m')",
            [date.year, date.month]
          );
        })
        .count('*', 'total');

      date.totalDesk = contractsDesk[0].$extras.total;
      date.totalRoom = contractsRoom[0].$extras.total;
      date.totalMeetRoom = contractsMeetRoom[0].$extras.total;
    }

    const totalDesks = desks[0].$extras.total;
    const totalRooms = rooms[0].$extras.total;
    const totalMeetRooms = meetRoom[0].$extras.total;

    for (const month of dates) {
      const vacanciesDesk = totalDesks > (month.totalDesk || 0) ? totalDesks : month.totalDesk;
      const vacanciesRooms = totalRooms > (month.totalRoom || 0) ? totalRooms : month.totalRoom;
      const vacanciesMeetRooms =
        totalMeetRooms > (month.totalMeetRoom || 0) ? totalMeetRooms : month.totalMeetRoom;

      month['open_desk'] = Math.round(((month.totalDesk || 0) * 100) / vacanciesDesk) || 0;
      month['private_room'] = Math.round(((month.totalRoom || 0) * 100) / vacanciesRooms) || 0;
      month['meet_room'] = Math.round(((month.totalMeetRoom || 0) * 100) / vacanciesMeetRooms) || 0;

      delete month.total;
      delete month.totalDesk;
      delete month.totalRoom;
      delete month.totalMeetRoom;
    }

    return dates;
  }

  private static async getSalesPipeline(coworkAccountId: number): Promise<SalesPipelineInterface> {
    const result: SalesPipelineInterface = {
      opportunity: 0,
      contacted: 0,
      requested: 0,
      quoted: 0,
      converted: 0
    };

    const opportunities = await LeadOpportunity.query()
      .preload('lead')
      .whereHas('lead', (leadQuery) => {
        leadQuery.where('cowork_account_id', coworkAccountId);
      });

    opportunities.forEach((opportunity) => {
      result[opportunity.status.toLowerCase()] += 1;
    });

    return result;
  }

  private static async getClientsProductCategory(
    coworkAccountId: number
  ): Promise<ClientsPerCategoryInterface> {
    const result: ClientsPerCategoryInterface = {
      virtual_office: 0,
      meeting_room: 0,
      open_desk: 0,
      private_room: 0
    };

    const contracts = await Contract.query()
      .select('service_type')
      .countDistinct('user_id', 'total')
      .where('cowork_account_id', coworkAccountId)
      .where('status', ContractStatusEnum.ACTIVE)
      .groupBy('service_type');

    contracts.forEach((contract) => {
      result[contract.serviceType.toLowerCase()] = contract.$extras.total;
    });

    return result;
  }

  private static async getInvoicesPerStatus(
    coworkAccountId: number
  ): Promise<InvoicesPerStatusInterface> {
    const result: InvoicesPerStatusInterface = {};

    const invoices = await Invoice.query().where('cowork_account_id', coworkAccountId);

    for (const invoice of invoices) {
      let status = invoice.getStatus();

      if (status === InvoiceStatusEnum.VIEWED || status === InvoiceStatusEnum.SENT) {
        status = 'open';
      } else {
        status = status.toLowerCase();
      }

      result[status] = result[status] ? result[status] + 1 : 1;
    }

    return result;
  }

  private static async getInvoicesVirtualOfficePerStatus(
    coworkAccountId: number
  ): Promise<InvoicesPerStatusInterface> {
    const result: InvoicesPerStatusInterface = {};

    const invoices = await Invoice.query()
      .where('cowork_account_id', coworkAccountId)
      .whereHas('items', (itemsQuery) => {
        itemsQuery.where('service_type', ServicesEnum.VIRTUAL_OFFICE);
      });

    for (const invoice of invoices) {
      let status = invoice.getStatus();

      if (status === InvoiceStatusEnum.VIEWED || status === InvoiceStatusEnum.SENT) {
        status = 'open';
      } else {
        status = status.toLowerCase();
      }

      result[status] = result[status] ? result[status] + 1 : 1;
    }

    return result;
  }

  private static async calcDeskOccupancy(coworkAccountId: number): Promise<number> {
    const desks = await Desk.query()
      .sum('quantity', 'total')
      .whereHas('location', (query) => {
        query.where('cowork_account_id', coworkAccountId);
      });

    const contracts = await Contract.query()
      .where('cowork_account_id', coworkAccountId)
      .where('status', ContractStatusEnum.ACTIVE)
      .whereIn('service_type', [ServicesEnum.OPEN_DESK])
      .count('*', 'total');

    const totalDesks = desks[0].$extras.total;
    const totalContracts = contracts[0].$extras.total;

    const totalVacancies = totalDesks > totalContracts ? totalDesks : totalContracts;

    return Math.round((totalContracts * 100) / totalVacancies) || 0;
  }

  private static async calcPrivateRoomsOccupancy(coworkAccountId: number): Promise<number> {
    const rooms = await Room.query()
      .sum('room_capacity', 'total')
      .whereHas('location', (query) => {
        query.where('cowork_account_id', coworkAccountId);
      });

    const contracts = await Contract.query()
      .where('cowork_account_id', coworkAccountId)
      .where('status', ContractStatusEnum.ACTIVE)
      .whereIn('service_type', [ServicesEnum.PRIVATE_ROOM])
      .count('*', 'total');

    const totalRooms = rooms[0].$extras.total;
    const totalContracts = contracts[0].$extras.total;

    const totalVacancies = totalRooms > totalContracts ? totalRooms : totalContracts;

    return Math.round((totalContracts * 100) / totalVacancies) || 0;
  }

  private static async getUnitsLocation(coworkAccountId: number): Promise<InfoLocationInterface[]> {
    const result: InfoLocationInterface[] = [];

    const locations: Location[] = await Location.query()
      .preload('address')
      .where('cowork_account_id', coworkAccountId);

    for (const location of locations) {
      if (location.address && location.address.latitude && location.address.longitude) {
        result.push({
          id: location.id,
          name: location.name,
          latitude: location.address.latitude,
          longitude: location.address.longitude
        });
      }
    }

    return result;
  }

  private static async calcBenefitsUsageCycle(coworkAccountId: number): Promise<number> {
    const contracts = await Contract.query()
      .where('cowork_account_id', coworkAccountId)
      .where('status', ContractStatusEnum.ACTIVE);

    const contractsIds = contracts.map((c) => c.id);
    const contractUsages = await ContractUsage.query().whereIn('contract_id', contractsIds);

    // Key: ContractId
    const usages: Record<
      number,
      {
        userId: number;
        totalUsage: number;
        totalAvailable: number;
      }
    > = {};

    // Count total benefits
    for (const contract of contracts) {
      if (Object.keys(usages).includes(contract.id)) {
        usages[contract.id].totalAvailable +=
          contract.coworkUsagePerMonth + contract.meetingRoomUsagePerMonth;
      } else {
        usages[contract.id] = {
          userId: contract.userId,
          totalUsage: 0,
          totalAvailable: contract.coworkUsagePerMonth + contract.meetingRoomUsagePerMonth
        };
      }
    }

    for (const usage of contractUsages) {
      usages[usage.contractId].totalUsage += 1;
    }

    // Group by UserId
    const grouped = groupBy(usages, (u) => u.userId);
    const usersMean: number[] = [];

    Object.keys(grouped).forEach((userId) => {
      let totalAvailable = 0;
      let totalUsage = 0;

      grouped[userId].forEach((contract) => {
        totalAvailable += contract.totalAvailable;
        totalUsage += contract.totalUsage;
      });

      usersMean.push((totalUsage * 100) / totalAvailable);
    });

    return Math.round(usersMean.reduce((a, b) => a + b, 0) / usersMean.length) || 0;
  }

  private static async getLeadsMembersLocation(
    coworkAccountId: number
  ): Promise<InfoLocationInterface[]> {
    const result: InfoLocationInterface[] = [];

    // Get clients company address
    const usersClients = await CoworkClient.query()
      .select('user_id')
      .where('cowork_account_id', coworkAccountId);
    const usersClientsIds = usersClients.map((c) => c.userId);
    const clients = await ClientAccount.query()
      .preload('companyAddress')
      .preload('user')
      .whereIn('user_id', usersClientsIds);

    for (const client of clients) {
      if (
        client.companyAddress &&
        client.companyAddress.latitude &&
        client.companyAddress.longitude
      ) {
        result.push({
          id: client.userId,
          name: client.companyName ? client.companyName : client.user.fullName,
          latitude: client.companyAddress.latitude,
          longitude: client.companyAddress.longitude
        });
      }
    }

    // Get lead address
    const leads = await Lead.query()
      .select('client_account_id')
      .where('cowork_account_id', coworkAccountId);
    const leadsClientsIds = leads.map((l) => l.clientAccountId);
    const leadsAccounts = await ClientAccount.query()
      .preload('companyAddress')
      .preload('user')
      .whereIn('id', leadsClientsIds);

    for (const lead of leadsAccounts) {
      if (lead.companyAddress && lead.companyAddress.latitude && lead.companyAddress.longitude) {
        result.push({
          id: lead.userId,
          name: lead.companyName ? lead.companyName : lead.user.fullName,
          latitude: lead.companyAddress.latitude,
          longitude: lead.companyAddress.longitude
        });
      }
    }

    return result;
  }

  private static async calcContractsAttention(
    coworkAccountId: number
  ): Promise<ContractsAttentionsInterface> {
    const result: ContractsAttentionsInterface = {
      auto_renewal: 0,
      cancelation: 0
    };

    // Um contrato ativo também pode ser auto-renewal. Como isso vai funcionar?
    const contracts = await Contract.query()
      .where('cowork_account_id', coworkAccountId)
      .where('status', ContractStatusEnum.ACTIVE)
      .whereRaw('DATE(date_end) >= DATE(NOW())');

    for (const contract of contracts) {
      if (contract.autoRenewal) {
        result.auto_renewal += 1;
      } else {
        result.cancelation += 1;
      }
    }

    return result;
  }

  private static async getMailboxOverview(
    coworkAccountId: number
  ): Promise<MailboxActionsInterface> {
    const result: MailboxActionsInterface = {
      picking_up: 0,
      hold: 0,
      forward: 0,
      trash: 0
    };

    const mailboxes = await Mailbox.query().whereHas('location', (locationQuery) => {
      locationQuery.where('cowork_account_id', coworkAccountId);
    });

    mailboxes.forEach((mailbox) => {
      switch (mailbox.requestedAction) {
        case MailboxClientEnum.PICK_UP:
          result.picking_up += 1;
          break;
        case MailboxClientEnum.HOLD_LOCATION:
          result.hold += 1;
          break;
        case MailboxClientEnum.FORWARD:
          result.forward += 1;
          break;
        case MailboxClientEnum.TRASH:
          result.trash += 1;
          break;
      }
    });

    return result;
  }
}
