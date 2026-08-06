import ClientAccount from 'App/Models/ClientAccount';
import CoworkClient from 'App/Models/CoworkClient';
import DayPass from 'App/Models/DayPass';
import Invoice from 'App/Models/Invoice';
import Lead from 'App/Models/Lead';
import Mailbox from 'App/Models/Mailbox';
import Meeting from 'App/Models/Meeting';
import Tour from 'App/Models/Tour';
import User from 'App/Models/User';
import { DateTime } from 'luxon';

interface UsersResponse {
  id: number;
  user_name: string;
  user_type: 'LEAD' | 'CLIENT';
  photo?: string | null;
  company_name?: string | null;
  user_email: string;
  user_phone?: string | null;
}

interface InvoiceResponse {
  id: number;
  status: string;
  client_name: string;
  due_date: DateTime;
}

interface MailboxResponse {
  id: number;
  status: string;
  client_name: string;
  received_date: DateTime;
}

interface BookingSchedulingResponse {
  id: number;
  type: 'DAYPASS' | 'MEETING' | 'TOUR';
  status: string;
  client_name: string;
  date: DateTime;
}

interface UserDetailsResponse {
  invoices: InvoiceResponse[];
  mailboxes: MailboxResponse[];
  bookings: BookingSchedulingResponse[];
}

interface LeadDetailsResponse {
  bookings: BookingSchedulingResponse[];
}

export default class SearchService {
  static async searchUser(user: User, q: string) {
    await user.load('coworkUser');
    const coworkAccountId = user.coworkUser.coworkAccountId;

    const [clients, leads] = await Promise.all([
      this.searchClient(coworkAccountId, q),
      this.searchLead(coworkAccountId, q)
    ]);

    const clientsNormalized = this.normalizeClient(clients);
    const leadsNormalized = this.normalizeLead(leads);

    const users: UsersResponse[] = [...clientsNormalized, ...leadsNormalized];

    return users;
  }

  static async getClientDetails(user: User, id: number) {
    await user.load('coworkUser');
    const coworkAccountId = user.coworkUser.coworkAccountId;

    const checkUserIsClient = await CoworkClient.query()
      .where('cowork_account_id', coworkAccountId)
      .where('user_id', id)
      .first();

    const response: UserDetailsResponse = {
      invoices: [],
      mailboxes: [],
      bookings: []
    };

    if (!checkUserIsClient) {
      return response;
    }

    const [invoices, mailboxes, bookings] = await Promise.all([
      this.getClientInvoices(coworkAccountId, id),
      this.getClientMailboxes(coworkAccountId, id),
      this.getClientBookings(coworkAccountId, id)
    ]);

    response.invoices = invoices;
    response.mailboxes = mailboxes;
    response.bookings = bookings;

    return response;
  }

  static async getLeadDetails(user: User, id: number) {
    await user.load('coworkUser');
    const coworkAccountId = user.coworkUser.coworkAccountId;

    const response: LeadDetailsResponse = {
      bookings: []
    };

    const lead = await Lead.query()
      .where('id', id)
      .where('cowork_account_id', coworkAccountId)
      .whereHas('clientAccount', (clientAccountQuery) => {
        clientAccountQuery.whereHas('user', (userQuery) => {
          userQuery.whereNull('deleted_at');
        });
      })
      .first();

    if (!lead) {
      return response;
    }

    const [bookings] = await Promise.all([this.getLeadBookings(coworkAccountId, id)]);

    response.bookings = bookings;

    return response;
  }

  private static async searchClient(coworkAccountId: number, q: string) {
    return await CoworkClient.query()
      .where('cowork_account_id', coworkAccountId)
      .preload('user', (query) => {
        query.whereNull('deleted_at');
        query.preload('photo');
        query.preload('clientAccount', (clientQuery) => {
          clientQuery.whereNull('deleted_at');
          clientQuery.preload('teamsMember', (teamsMemberQuery) => {
            teamsMemberQuery.whereNull('deleted_at');
            teamsMemberQuery.preload('team', (teamQuery) => {
              teamQuery.whereNull('deleted_at');
              teamQuery.preload('clientAccount', (clientAccountQuery) => {
                clientAccountQuery.whereNull('deleted_at');
              });
            });
          });
        });
      })
      .whereHas('user', (query) => {
        query.whereRaw("CONCAT(first_name, ' ', last_name) like ?", [`%${q}%`]);
        query.orWhere('email', 'like', `%${q}%`);
        query.orWhere('personal_phone', 'like', `%${q}%`);
        query.orWhereHas('clientAccount', (clientQuery) => {
          clientQuery.where('company_name', 'like', `%${q}%`);
          clientQuery.orWhereHas('teamsMember', (teamsMemberQuery) => {
            teamsMemberQuery.whereHas('team', (teamQuery) => {
              teamQuery.whereHas('clientAccount', (clientAccountQuery) => {
                clientAccountQuery.where('company_name', 'like', `%${q}%`);
              });
            });
          });
        });
      })
      .limit(10);
  }

  private static async searchLead(coworkAccountId: number, q: string) {
    return await Lead.query()
      .where('cowork_account_id', coworkAccountId)
      .preload('clientAccount', (clientQuery) => {
        clientQuery.whereNull('deleted_at');
        clientQuery.preload('user', (userQuery) => {
          userQuery.preload('photo');
          userQuery.whereNull('deleted_at');
        });
      })
      .whereHas('clientAccount', (clientQuery) => {
        clientQuery.where('company_name', 'like', `%${q}%`);
        clientQuery.orWhereHas('user', (userQuery) => {
          userQuery.whereRaw("CONCAT(first_name, ' ', last_name) like ?", [`%${q}%`]);
          userQuery.orWhere('email', 'like', `%${q}%`);
          userQuery.orWhere('personal_phone', 'like', `%${q}%`);
        });
      })
      .limit(10);
  }

  private static async getClientInvoices(coworkAccountId: number, id: number) {
    const response: InvoiceResponse[] = [];

    const invoices: Invoice[] = await Invoice.query()
      .preload('user')
      .where('cowork_account_id', coworkAccountId)
      .where('user_id', id)
      .orderBy('due_date', 'desc')
      .limit(5);

    for (const invoice of invoices) {
      response.push({
        id: invoice.id,
        status: invoice.status,
        client_name: invoice.user.fullName,
        due_date: invoice.dueDate
      });
    }

    return response;
  }

  private static async getClientMailboxes(coworkAccountId: number, id: number) {
    const clientAccount = await ClientAccount.query().preload('user').where('user_id', id).first();

    if (!clientAccount) {
      return [];
    }

    const mailboxes: Mailbox[] = await Mailbox.query()
      .whereHas('location', (locationQuery) => {
        locationQuery.where('cowork_account_id', coworkAccountId);
      })
      .where('client_account_id', clientAccount.id)
      .orderBy('delivery_date', 'DESC')
      .limit(5);

    const response: MailboxResponse[] = [];
    mailboxes.forEach((mailbox) => {
      response.push({
        id: mailbox.id,
        status: mailbox.status,
        client_name: clientAccount.user.fullName,
        received_date: mailbox.deliveryDate
      });
    });

    return response;
  }

  private static async getClientBookings(coworkAccountId: number, id: number) {
    const [dayPasses, meetings, tours] = await Promise.all([
      this.searchDayPass(coworkAccountId, id),
      this.searchMeetings(coworkAccountId, id),
      this.searchTours(coworkAccountId, id)
    ]);

    let response: BookingSchedulingResponse[] = [];

    dayPasses.forEach((dayPass) => {
      response.push({
        id: dayPass.id,
        type: 'DAYPASS',
        status: dayPass.status,
        client_name: dayPass.client.fullName,
        date: dayPass.date
      });
    });

    meetings.forEach((meeting) => {
      response.push({
        id: meeting.id,
        type: 'MEETING',
        status: meeting.status,
        client_name: meeting.user.fullName,
        date: meeting.dateStart
      });
    });

    tours.forEach((tour) => {
      response.push({
        id: tour.id,
        type: 'TOUR',
        status: tour.status,
        client_name: tour.user.fullName,
        date: tour.dateStart
      });
    });

    response.sort((a, b) => b.date.toMillis() - a.date.toMillis());
    return response.slice(0, 5);
  }

  private static async getLeadBookings(coworkAccountId: number, id: number) {
    const [dayPasses, tours] = await Promise.all([
      this.searchLeadDayPass(coworkAccountId, id),
      this.searchLeadTours(coworkAccountId, id)
    ]);

    let response: BookingSchedulingResponse[] = [];

    dayPasses.forEach((dayPass) => {
      response.push({
        id: dayPass.id,
        type: 'DAYPASS',
        status: dayPass.status,
        client_name: dayPass.lead.clientAccount.user.fullName,
        date: dayPass.date
      });
    });

    tours.forEach((tour) => {
      response.push({
        id: tour.id,
        type: 'TOUR',
        status: tour.status,
        client_name: tour.user.fullName,
        date: tour.dateStart
      });
    });

    response.sort((a, b) => b.date.toMillis() - a.date.toMillis());
    return response.slice(0, 5);
  }

  private static async searchDayPass(coworkAccountId: number, id: number): Promise<DayPass[]> {
    return await DayPass.query()
      .where('cowork_account_id', coworkAccountId)
      .where('client_id', id)
      .preload('client');
  }

  private static async searchLeadDayPass(coworkAccountId: number, id: number): Promise<DayPass[]> {
    return await DayPass.query()
      .where('cowork_account_id', coworkAccountId)
      .where('lead_id', id)
      .preload('lead', (leadQuery) => {
        leadQuery.preload('clientAccount', (clientAccountQuery) => {
          clientAccountQuery.preload('user');
        });
      });
  }

  private static async searchMeetings(coworkAccountId: number, id: number): Promise<Meeting[]> {
    return await Meeting.query()
      .where('cowork_account_id', coworkAccountId)
      .where('user_id', id)
      .preload('user');
  }

  private static async searchTours(coworkAccountId: number, id: number): Promise<Tour[]> {
    return await Tour.query()
      .preload('user', (b) => {
        b.preload('clientAccount');
      })
      .whereHas('location', (b) => {
        b.where('cowork_account_id', coworkAccountId);
      })
      .where('user_id', id);
    // .whereHas('lead', (leadQuery) => {
    //   leadQuery.whereHas('clientAccount', (clientAccountQuery) => {
    //     clientAccountQuery.where('user_id', id);
    //   });
    // });
  }

  private static async searchLeadTours(coworkAccountId: number, id: number): Promise<Tour[]> {
    return await Tour.query()
      .preload('user', (b) => {
        b.preload('clientAccount');
      })
      .whereHas('location', (b) => {
        b.where('cowork_account_id', coworkAccountId);
      })
      .where('lead_id', id);
  }

  private static normalizeClient(clients: CoworkClient[]) {
    const users: UsersResponse[] = [];

    for (const client of clients) {
      if (!client.user) {
        continue;
      }

      let companyName = '';

      if (client.user.clientAccount && client.user.clientAccount.companyName) {
        companyName = client.user.clientAccount.companyName;
      } else if (
        client.user.clientAccount &&
        client.user.clientAccount.teamsMember &&
        client.user.clientAccount.teamsMember[0]?.team?.clientAccount?.companyName
      ) {
        companyName = client.user.clientAccount.teamsMember[0].team.clientAccount.companyName;
      }

      users.push({
        id: client.user.id,
        user_name: client.user.fullName,
        user_email: client.user.email,
        user_phone: client.user.personalPhone,
        user_type: 'CLIENT',
        photo: client.user.photo?.file,
        company_name: companyName
      });
    }

    return users;
  }

  private static normalizeLead(leads: Lead[]) {
    const users: UsersResponse[] = [];

    for (const lead of leads) {
      if (!lead.clientAccount || !lead.clientAccount.user) {
        continue;
      }

      users.push({
        id: lead.id,
        user_name: lead.clientAccount.user.fullName,
        user_email: lead.clientAccount.user.email,
        user_phone: lead.clientAccount.user.personalPhone,
        user_type: 'LEAD',
        photo: lead.clientAccount.user.photo?.file,
        company_name: lead.clientAccount.companyName
      });
    }

    return users;
  }
}
