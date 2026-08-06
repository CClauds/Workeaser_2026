import ClientAccount from 'App/Models/ClientAccount';
import DayPass from 'App/Models/DayPass';
import Desk from 'App/Models/Desk';
import Location from 'App/Models/Location';
import Meeting from 'App/Models/Meeting';
import Room from 'App/Models/Room';
import Team from 'App/Models/Team';
import Tour from 'App/Models/Tour';
import User from 'App/Models/User';
import ClientAuthorizationService from 'App/Services/Client/ClientAuthorizationService';
import {
  DayPassStatusEnum,
  DayPassUserTypeEnum,
  MeetingStatusEnum,
  ServicesEnum,
  ToursStatusEnum
} from 'Contracts/enums';
import { DateTime } from 'luxon';

export interface UnapprovedBookings {
  id: number;
  user_name: string;
  user_email: string;
  booking_type: string;
  service_type: string;
  resource_name: string;
  location_name: string;
  start_date: DateTime;
  end_date: DateTime;
  status: string;
  potential_earnings: number;
}

export interface AgendaItem {
  id: number;
  type: string;
  service_type?: string;
  user: UserAgenda;
  company_name?: string | null;
  location_name: string;
  date_start: DateTime;
  date_end: DateTime;
  additional_information?: string;
  status: string;
}

export interface UserAgenda {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export default class BookingsAndAgendaService {
  static async unapproved(user: User) {
    await user.load('coworkUser');

    const bookings: UnapprovedBookings[] = [];

    const dayPasses: DayPass[] = await DayPass.query()
      .preload('client')
      .preload('location')
      .preload('lead', (query) => {
        query.preload('clientAccount', (clientAccountQuery) => {
          clientAccountQuery.preload('user');
        });
      })
      .where('cowork_account_id', user.coworkUser.coworkAccountId)
      .where('status', DayPassStatusEnum.SOLICITED)
      .whereHas('location', (q) => {
        q.whereNull('deleted_at');
      })
      .where((w) => {
        w.whereHas('client', (q) => {
          q.whereNull('deleted_at');
        });
        w.orWhereHas('lead', (q) => {
          q.whereNull('deleted_at');
          q.whereHas('clientAccount', (c) => {
            c.whereNull('deleted_at');
            c.whereHas('user', (u) => {
              u.whereNull('deleted_at');
            });
          });
        });
      });

    const meetings: Meeting[] = await Meeting.query()
      .where('cowork_account_id', user.coworkUser.coworkAccountId)
      .where('status', MeetingStatusEnum.SOLICITED)
      .preload('user')
      .preload('meetroom')
      .preload('location')
      .whereHas('location', (q) => {
        q.whereNull('deleted_at');
      })
      .whereHas('user', (q) => {
        q.whereNull('deleted_at');
      })
      .whereHas('meetroom', (q) => {
        q.whereNull('deleted_at');
      });

    const tours: Tour[] = await Tour.query()
      .where('status', ToursStatusEnum.SOLICITED)
      .preload('user')
      .preload('location')
      .whereHas('location', (b) => {
        b.where('cowork_account_id', user.coworkUser.coworkAccountId);
        b.whereNull('deleted_at');
      });

    for (const daypass of dayPasses) {
      let clientName;
      let clientEmail;
      let resourceName = '';
      let potentialEarnings = 0;

      switch (daypass.userType) {
        case DayPassUserTypeEnum.CLIENT:
          clientName = daypass.client.fullName;
          clientEmail = daypass.client.email;
          break;
        case DayPassUserTypeEnum.LEAD:
          clientName = daypass.lead.clientAccount.user.fullName;
          clientEmail = daypass.lead.clientAccount.user.email;
          break;
      }

      switch (daypass.space) {
        case ServicesEnum.OPEN_DESK:
          const desk: Desk = await Desk.query().where('id', daypass.resourceId).first();

          if (desk) {
            await desk.load('prices');
            resourceName = desk.name;

            if (desk.prices.length) {
              const firstPrice = desk.prices[0];
              const durationInDays = firstPrice.getDurationInDays();
              const priceValue = firstPrice.monthlyPrice || firstPrice.fullPrice;
              potentialEarnings = Math.round(priceValue / durationInDays);
            }
          }

          break;
        case ServicesEnum.PRIVATE_ROOM:
          const room: Room = await Room.query().where('id', daypass.resourceId).first();

          if (room) {
            await room.load('prices');
            resourceName = room.name;

            if (room.prices.length) {
              const firstPrice = room.prices[0];
              const durationInDays = firstPrice.getDurationInDays();
              const priceValue = firstPrice.monthlyPrice || firstPrice.fullPrice;
              potentialEarnings = Math.round(priceValue / durationInDays);
            }
          }

          break;
      }

      bookings.push({
        id: daypass.id,
        user_name: clientName,
        user_email: clientEmail,
        booking_type: 'DAY_PASS',
        service_type: daypass.space,
        resource_name: resourceName,
        location_name: daypass.location?.name,
        start_date: daypass.date,
        end_date: daypass.date,
        status: daypass.status,
        potential_earnings: potentialEarnings
      });
    }

    for (const tour of tours) {
      const clientName = tour.user.fullName;
      const clientEmail = tour.user.email;

      bookings.push({
        id: tour.id,
        user_name: clientName,
        user_email: clientEmail,
        booking_type: 'TOUR',
        service_type: 'TOUR',
        resource_name: 'Tour',
        location_name: tour.location?.name,
        start_date: tour.dateStart,
        end_date: tour.dateEnd,
        status: tour.status,
        potential_earnings: 0
      });
    }

    for (const meeting of meetings) {
      const potentialEarnings =
        Math.round((meeting.quantityMinutes / 60) * (meeting.pricePerHour / 100) * 100) -
        meeting.amountDiscount;

      bookings.push({
        id: meeting.id,
        user_name: meeting.user.fullName,
        user_email: meeting.user.email,
        booking_type: ServicesEnum.MEETING_ROOM,
        service_type: ServicesEnum.MEETING_ROOM,
        resource_name: meeting.meetroom?.name,
        location_name: meeting.location?.name,
        start_date: meeting.dateStart,
        end_date: meeting.dateEnd,
        status: meeting.status,
        potential_earnings: potentialEarnings
      });
    }

    return bookings;
  }

  static async scheduled(
    user: User,
    month: number = DateTime.now().month,
    year: number = DateTime.now().year
  ) {
    await user.load('coworkUser');
    const items: AgendaItem[] = [];

    const locations: Location[] = await Location.query()
      .where('cowork_account_id', user.coworkUser.coworkAccountId)
      .preload('tours', (b) => {
        b.where('status', ToursStatusEnum.APPROVED);
        b.where((q) => {
          q.whereRaw('YEAR(date_start) = ? AND MONTH(date_start) = ?', [year, month]);
          q.orWhereRaw('YEAR(date_end) = ? AND MONTH(date_end) = ?', [year, month]);
        });
        b.preload('user', (userQuery) => {
          userQuery.preload('clientAccount', (ca) => {
            ca.whereNull('deleted_at');
          });
        });
        // b.whereHas('lead', (q) => {
        //   q.whereNull('deleted_at');
        //   q.whereHas('clientAccount', (c) => {
        //     c.whereNull('deleted_at');
        //     c.whereHas('user', (u) => {
        //       u.whereNull('deleted_at');
        //     });
        //   });
        // });
      })
      .preload('dayPasses', (b) => {
        b.where('status', DayPassStatusEnum.APPROVED);
        b.whereRaw('YEAR(date) = ? AND MONTH(date) = ?', [year, month]);

        b.preload('lead', (leadQuery) => {
          leadQuery.preload('clientAccount', (clientAccountQuery) => {
            clientAccountQuery.preload('user', (userQuery) => {
              userQuery.preload('clientAccount');
            });
          });
        });

        b.preload('client', (clientQuery) => {
          clientQuery.preload('clientAccount');
        });

        b.where((w) => {
          w.whereHas('client', (q) => {
            q.whereNull('deleted_at');
            q.whereHas('clientAccount', (c) => {
              c.whereNull('deleted_at');
            });
          });
          w.orWhereHas('lead', (q) => {
            q.whereNull('deleted_at');
            q.whereHas('clientAccount', (c) => {
              c.whereNull('deleted_at');
              c.whereHas('user', (u) => {
                u.whereNull('deleted_at');
              });
            });
          });
        });
      })
      .preload('meetings', (b) => {
        b.where('status', MeetingStatusEnum.APPROVED);
        b.where((q) => {
          q.whereRaw('YEAR(date_start) = ? AND MONTH(date_start) = ?', [year, month]);
          q.orWhereRaw('YEAR(date_end) = ? AND MONTH(date_end) = ?', [year, month]);
        });

        b.preload('user', (userQuery) => {
          userQuery.preload('clientAccount');
        });

        b.whereHas('user', (u) => {
          u.whereNull('deleted_at');
          u.whereHas('clientAccount', (clientAccount) => {
            clientAccount.whereNull('deleted_at');
          });
        });
      });

    for (const location of locations) {
      // Get tours data
      for (const tour of location.tours) {
        let companyName = tour.user.clientAccount.companyName;

        const clientTeam = await ClientAuthorizationService.getClientTeam(
          tour.user.clientAccount.id
        );

        if (clientTeam.clientAccountId !== tour.user.clientAccount.id) {
          const clientAccount = await ClientAccount.findOrFail(clientTeam.clientAccountId);
          companyName = clientAccount.companyName;
        }

        items.push({
          id: tour.id,
          type: 'TOUR',
          user: {
            id: tour.user.id,
            first_name: tour.user.firstName,
            last_name: tour.user.lastName,
            email: tour.user.email
          },
          company_name: companyName,
          location_name: location.name,
          date_start: tour.dateStart,
          date_end: tour.dateEnd,
          status: tour.status
        });
      }

      // Get Day Passes data
      for (const dayPass of location.dayPasses) {
        let user: User;
        let clientTeam: Team;
        let companyName: string;

        if (dayPass.userType === DayPassUserTypeEnum.CLIENT) {
          user = dayPass.client;
          companyName = dayPass.client.clientAccount.companyName || '';
          clientTeam = await ClientAuthorizationService.getClientTeam(
            dayPass.client.clientAccount.id
          );

          if (clientTeam.clientAccountId !== dayPass.client.clientAccount.id) {
            const clientAccount = await ClientAccount.findOrFail(clientTeam.clientAccountId);
            companyName = clientAccount.companyName || '';
          }
        } else {
          user = dayPass.lead.clientAccount.user;
          companyName = dayPass.lead.clientAccount.companyName || '';
          clientTeam = await ClientAuthorizationService.getClientTeam(dayPass.lead.clientAccountId);

          if (clientTeam.clientAccountId !== dayPass.lead.clientAccountId) {
            const clientAccount = await ClientAccount.findOrFail(clientTeam.clientAccountId);
            companyName = clientAccount.companyName || '';
          }
        }

        items.push({
          id: dayPass.id,
          type: 'DAY_PASS',
          service_type: dayPass.space,
          user: {
            id: user.id,
            first_name: user.firstName,
            last_name: user.lastName,
            email: user.email
          },
          company_name: companyName,
          location_name: location.name,
          date_start: dayPass.date,
          date_end: dayPass.date,
          status: dayPass.status
        });
      }

      // Get meeting data
      for (const meeting of location.meetings) {
        const clientTeam = await ClientAuthorizationService.getClientTeam(
          meeting.user.clientAccount.id
        );

        let companyName: string = meeting.user.clientAccount.companyName || '';

        if (clientTeam.clientAccountId !== meeting.user.clientAccount.id) {
          const clientAccount = await ClientAccount.findOrFail(clientTeam.clientAccountId);
          companyName = clientAccount.companyName || '';
        }

        items.push({
          id: meeting.id,
          type: 'MEETING',
          user: {
            id: meeting.user.id,
            first_name: meeting.user.firstName,
            last_name: meeting.user.lastName,
            email: meeting.user.email
          },
          company_name: companyName,
          location_name: location.name,
          date_start: meeting.dateStart,
          date_end: meeting.dateEnd,
          additional_information: meeting.additionalInformation,
          status: meeting.status
        });
      }
    }

    return items;
  }
}
