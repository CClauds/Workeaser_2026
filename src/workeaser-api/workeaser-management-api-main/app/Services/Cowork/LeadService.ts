import Env from '@ioc:Adonis/Core/Env';
import Event from '@ioc:Adonis/Core/Event';
import Database from '@ioc:Adonis/Lucid/Database';
import Address from 'App/Models/Address';
import Lead from 'App/Models/Lead';
import LeadOpportunity from 'App/Models/LeadOpportunity';
import Service from 'App/Models/Service';
import Team from 'App/Models/Team';
import User from 'App/Models/User';
import AppError from 'App/Utils/AppError';
import { LeadStatusEnum, UserRoleEnum } from 'Contracts/enums';
import Crypto from 'crypto';
import Pick from 'lodash/pick';
import { DateTime } from 'luxon';

export interface Sale {
  id: number;
  name: string;
  type: string;
}

export interface SalePipeline {
  opportunity: Sale[];
  contacted: Sale[];
  requested: Sale[];
  quoted: Sale[];
  converted: Sale[];
}

export interface SalePipelineRequest {
  lead_id: number;
  service: string;
}

export interface SalePipelineUpdateRequest {
  status?: string;
  notes?: string;
}

interface StoreLeadInterface {
  client_account: {
    company_name?: string;
    company_email?: string;
    company_phone?: string;
    company_address?: {
      fulltext?: string;
      latitude?: number;
      longitude?: number;
      country?: string;
    };
    personal_address?: {
      fulltext?: string;
      latitude?: number;
      longitude?: number;
      country?: string;
    };
    user: {
      first_name: string;
      last_name: string;
      email: string;
      personal_phone?: string;
    };
  };
  opportunities?: {
    service: string;
  }[];
}

interface FilterSearch {
  general_query?: any;
  contact_date_start?: string;
  contact_date_end?: string;

  inters_virtual_office?: boolean;
  inters_shared_desk?: boolean;
  inters_meeting_room?: boolean;
  inters_private_office?: boolean;

  pipe_st_opportunity?: boolean;
  pipe_st_requested?: boolean;
  pipe_st_converted?: boolean;
  pipe_st_contacted?: boolean;
  pipe_st_quoted?: boolean;
}

export default class LeadService {
  static async list(user: User, filters: FilterSearch, paginate = true, page = 1) {
    await user.load('coworkUser');

    const query = Lead.query()
      .where('cowork_account_id', user.coworkUser.coworkAccountId)
      .preload('opportunities', (opportunitiesQuery) => {
        opportunitiesQuery.preload('service');
      })
      .preload('clientAccount', (clientAccountQuery) => {
        clientAccountQuery.preload('user', (u) => {
          u.preload('photo');
          u.preload('personalAddress');
        });
      })
      .whereHas('clientAccount', (q) => {
        q.whereNull('deleted_at');
        q.whereHas('user', (u) => {
          u.whereNull('deleted_at');
        });
      });

    if (filters.general_query) {
      query.whereHas('clientAccount', (clientAccountQuery) => {
        clientAccountQuery.whereHas('user', (userQuery) => {
          userQuery
            .where('first_name', 'like', `%${filters.general_query}%`)
            .orWhere('last_name', 'like', `%${filters.general_query}%`)
            .orWhere('email', 'like', `%${filters.general_query}%`)
            .orWhere('personal_phone', 'like', `%${filters.general_query}%`)
            .orWhereHas('clientAccount', (clientQuery) => {
              clientQuery.where('company_name', 'like', `%${filters.general_query}%`);
            });
        });
      });
    }

    // Filter last contact date
    if (filters.contact_date_start && filters.contact_date_end) {
      query.whereBetween('last_contact', 'like', [
        `%${filters.contact_date_start}%`,
        `%${filters.contact_date_end}%`
      ]);
    } else if (filters.contact_date_start) {
      query.where('last_contact', 'like', `%${filters.contact_date_start}%`);
    } else if (filters.contact_date_end) {
      query.where('last_contact', 'like', `%${filters.contact_date_end}%`);
    }

    if (filters.inters_virtual_office) {
      query.whereHas('opportunities', (opportunitiesQuery) => {
        opportunitiesQuery.whereHas('service', (serviceQuery) => {
          serviceQuery.where('slug', 'VIRTUAL_OFFICE');
        });
      });
    }

    if (filters.inters_shared_desk) {
      query.whereHas('opportunities', (opportunitiesQuery) => {
        opportunitiesQuery.whereHas('service', (serviceQuery) => {
          serviceQuery.where('slug', 'OPEN_DESK');
        });
      });
    }

    if (filters.inters_meeting_room) {
      query.whereHas('opportunities', (opportunitiesQuery) => {
        opportunitiesQuery.whereHas('service', (serviceQuery) => {
          serviceQuery.where('slug', 'MEETING_ROOM');
        });
      });
    }

    if (filters.inters_private_office) {
      query.whereHas('opportunities', (opportunitiesQuery) => {
        opportunitiesQuery.whereHas('service', (serviceQuery) => {
          serviceQuery.where('slug', 'PRIVATE_ROOM');
        });
      });
    }

    if (filters.pipe_st_opportunity) {
      query.whereHas('opportunities', (opportunitiesQuery) => {
        opportunitiesQuery.where('status', 'OPPORTUNITY');
      });
    }

    if (filters.pipe_st_requested) {
      query.whereHas('opportunities', (opportunitiesQuery) => {
        opportunitiesQuery.where('status', 'REQUESTED');
      });
    }

    if (filters.pipe_st_converted) {
      query.whereHas('opportunities', (opportunitiesQuery) => {
        opportunitiesQuery.where('status', 'CONVERTED');
      });
    }

    if (filters.pipe_st_contacted) {
      query.whereHas('opportunities', (opportunitiesQuery) => {
        opportunitiesQuery.where('status', 'CONTACTED');
      });
    }

    if (filters.pipe_st_quoted) {
      query.whereHas('opportunities', (opportunitiesQuery) => {
        opportunitiesQuery.where('status', 'QUOTED');
      });
    }

    return paginate ? await query.paginate(page, Env.get('ITEMS_PER_PAGE')) : await query;
  }

  static async show(id: number, user: User) {
    await user.load('coworkUser');

    const lead = await Lead.query()
      .where('id', id)
      .preload('opportunities', (opportunitiesQuery) => {
        opportunitiesQuery.preload('service');
      })
      .preload('clientAccount', (clientAccountQuery) => {
        clientAccountQuery.preload('user');
      })
      .first();

    if (!lead || user.coworkUser.coworkAccountId !== lead.coworkAccountId) {
      throw new AppError(AppError.NOT_FOUND, 'Lead not found');
    }

    return lead;
  }

  static async store(data: StoreLeadInterface, user: User): Promise<Lead> {
    const trx = await Database.transaction();
    await user.load('coworkUser');

    try {
      let userLead;
      let clientAccountId;

      const searchUser: User = await User.query()
        .where('email', data.client_account.user.email)
        .where('role', UserRoleEnum.CLIENT)
        .preload('clientAccount')
        .whereNull('deleted_at')
        .first();

      if (searchUser?.clientAccount && searchUser.clientAccount.id) {
        const searchLead = await Lead.query()
          .where('cowork_account_id', user.coworkUser.coworkAccountId)
          .andWhere('client_account_id', searchUser.clientAccount.id);

        if (!searchLead) {
          userLead = searchUser;
          clientAccountId = searchUser.clientAccount.id;
        }
      } else {
        const newUser = new User();

        newUser.merge(Pick(data.client_account.user, User.fillable));
        newUser.role = UserRoleEnum.CLIENT;
        newUser.password = Crypto.randomBytes(4).toString('hex');
        newUser.emailConfirmed = true;

        await newUser.useTransaction(trx).save();
        userLead = newUser;

        if (data.client_account.personal_address) {
          const newPersonalAddress = await new Address()
            .merge(data.client_account.personal_address)
            .useTransaction(trx)
            .save();

          await userLead
            .useTransaction(trx)
            .related('personalAddress')
            .associate(newPersonalAddress);
        }

        const clientAccount = await userLead.useTransaction(trx).related('clientAccount').create({
          companyName: data.client_account.company_name,
          companyPhone: data.client_account.company_phone,
          companyEmail: data.client_account.company_email
        });

        clientAccountId = clientAccount.id;

        if (data.client_account.company_address) {
          const newCompanyAddress = await new Address()
            .merge(data.client_account.company_address)
            .useTransaction(trx)
            .save();

          await clientAccount
            .useTransaction(trx)
            .related('companyAddress')
            .associate(newCompanyAddress);
        }

        await Team.create(
          {
            clientAccountId: clientAccount.id
          },
          { client: trx }
        );
      }

      const lead = await Lead.firstOrCreate(
        {
          coworkAccountId: user.coworkUser.coworkAccountId,
          clientAccountId: clientAccountId
        },
        {
          coworkAccountId: user.coworkUser.coworkAccountId,
          clientAccountId: clientAccountId
        },
        { client: trx }
      );

      lead.lastContact = DateTime.now();
      await lead.useTransaction(trx).save();

      if (data.opportunities) {
        const servicesSlugs = data.opportunities.map((x) => x.service);
        const services = await Service.query().whereIn('slug', servicesSlugs);
        const servicesIds = services.map((x) => x.id);

        const opportunities: any[] = [];

        servicesIds.forEach((id) => {
          opportunities.push({
            leadId: lead.id,
            serviceId: id,
            status: LeadStatusEnum.OPPORTUNITY
          });
        });

        await lead.related('opportunities').createMany(opportunities);
      }

      await trx.commit();
      Event.emit('user:new_lead', { id: lead.id });

      return lead;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async update(id: number, user: User, data: any = {}) {
    await user.load('coworkUser');

    const lead = await Lead.query().preload('clientAccount').where('id', id).firstOrFail();

    if (lead.coworkAccountId !== user.coworkUser.coworkAccountId) {
      throw new AppError(AppError.NOT_FOUND, 'Lead not found');
    }

    const trx = await Database.transaction();

    try {
      const leadUser = await User.findOrFail(lead.clientAccount.userId);
      await leadUser.load('clientAccount');

      await leadUser.clientAccount
        .useTransaction(trx)
        .merge({
          companyName: data.client_account.company_name,
          companyPhone: data.client_account.company_phone,
          companyEmail: data.client_account.company_email
        })
        .save();

      await lead
        .merge({
          lastContact: data.last_contact
        })
        .useTransaction(trx)
        .save();

      if (leadUser.clientAccount.companyAddressId) {
        const companyAddress = await Address.findOrFail(leadUser.clientAccount.companyAddressId);

        await companyAddress.merge(data.client_account.company_address).useTransaction(trx).save();
      } else if (data.client_account.company_address) {
        const newCompanyAddress = await Address.create(data.client_account.company_address, {
          client: trx
        });

        leadUser.clientAccount.companyAddressId = newCompanyAddress.id;
        await leadUser.clientAccount.useTransaction(trx).save();
      }

      if (leadUser.personalAddressId) {
        const personalAddress = await Address.findOrFail(leadUser.personalAddressId);

        await personalAddress
          .merge(data.client_account.personal_address)
          .useTransaction(trx)
          .save();
      } else if (data.client_account.personal_address) {
        const newPersonalAddress = await Address.create(data.client_account.personal_address, {
          client: trx
        });

        leadUser.personalAddressId = newPersonalAddress.id;
        await leadUser.useTransaction(trx).save();
      }

      if (data.client_account.user) {
        await leadUser
          .merge(Pick(data.client_account.user, [...User.fillable]))
          .useTransaction(trx)
          .save();
      }

      await trx.commit();

      Event.emit('lead:update', { id: lead.id });

      return lead;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async salesPipeline(user: User) {
    await user.load('coworkUser');

    const opportunities: LeadOpportunity[] = await LeadOpportunity.query()
      .preload('lead', (leadQuery) => {
        leadQuery.preload('clientAccount', (clientAccountQuery) => {
          clientAccountQuery.preload('user');
        });
      })
      .preload('service')
      .whereHas('lead', (leadQuery) => {
        leadQuery.whereNull('deleted_at');
        leadQuery.where('cowork_account_id', user.coworkUser.coworkAccountId);
        leadQuery.whereHas('clientAccount', (c) => {
          c.whereNull('deleted_at');
          c.whereHas('user', (u) => {
            u.whereNull('deleted_at');
          });
        });
      });

    const result: SalePipeline = {
      opportunity: [],
      contacted: [],
      requested: [],
      quoted: [],
      converted: []
    };

    opportunities.forEach((opportunity) => {
      const sale: Sale = {
        id: opportunity.id,
        name: opportunity.lead.clientAccount.user.fullName,
        type: opportunity.service.slug
      };

      result[opportunity.status.toLowerCase()].push(sale);
    });

    return result;
  }

  static async storeSalesPipeline(user: User, data: SalePipelineRequest) {
    await user.load('coworkUser');

    const service = await Service.query().where('slug', data.service).first();

    const lead = await Lead.query().where('id', data.lead_id).first();

    if (!service) {
      throw new AppError(AppError.BAD_REQUEST, 'Invalid service');
    }

    if (!lead || lead.coworkAccountId !== user.coworkUser.coworkAccountId) {
      throw new AppError(AppError.BAD_REQUEST, 'Invalid Lead');
    }

    await LeadOpportunity.create({
      leadId: lead.id,
      serviceId: service.id,
      status: LeadStatusEnum.OPPORTUNITY
    });
  }

  static async updateSalesPipeline(
    user: User,
    opportunityId: number,
    data: SalePipelineUpdateRequest
  ) {
    await user.load('coworkUser');

    const opportunity = await LeadOpportunity.query()
      .where('id', opportunityId)
      .whereHas('lead', (leadQuery) => {
        leadQuery.where('cowork_account_id', user.coworkUser.coworkAccountId);
      })
      .first();

    if (!opportunity) {
      throw new AppError(AppError.NOT_FOUND, 'Opportunity not found');
    }

    opportunity.merge(data);
    await opportunity.save();

    return opportunity;
  }

  static async updateSalesPipelineStatus(user: User, opportunityId: number, status: string) {
    await user.load('coworkUser');

    const opportunity = await LeadOpportunity.query()
      .where('id', opportunityId)
      .whereHas('lead', (leadQuery) => {
        leadQuery.where('cowork_account_id', user.coworkUser.coworkAccountId);
      })
      .first();

    if (!opportunity) {
      throw new AppError(AppError.NOT_FOUND, 'Opportunity not found');
    }

    opportunity.status = status;
    await opportunity.save();

    return opportunity;
  }

  static async delete(id: number, user: User) {
    await user.load('coworkUser');

    const lead = await Lead.find(id);

    if (!lead || lead.coworkAccountId !== user.coworkUser.coworkAccountId) {
      throw new AppError(AppError.NOT_FOUND, 'Lead not found');
    }

    await lead.softDelete();
    Event.emit('lead:delete', { id });
  }
}
