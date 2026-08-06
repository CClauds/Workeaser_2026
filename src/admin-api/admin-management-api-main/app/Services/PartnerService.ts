import { DateTime } from 'luxon'
import Partner from 'App/Models/Partner'
import AppError from 'App/Utils/Errors'
import { PartnerRoleEnum } from 'Contracts/enums'
import Pick from 'lodash/pick'

interface CreatePayload {
  first_name: string
  last_name: string
  email: string
  password: string
  role?: PartnerRoleEnum
  profile_image_url?: string
}

interface UpdatePayload {
  first_name?: string
  last_name?: string
  email?: string
  password?: string
  role?: PartnerRoleEnum
  profile_image_url?: string
}

interface ListOpts {
  page?: number
  perPage?: number
  search?: string
}

function toCamel(payload: any) {
  if (!payload) return {}
  return {
    firstName: payload.first_name,
    lastName: payload.last_name,
    email: payload.email,
    password: payload.password,
    role: payload.role,
    profileImageUrl: payload.profile_image_url,
  }
}

export default class PartnerService {
  static async list({ page = 1, perPage = 20, search }: ListOpts) {
    const query = Partner.query().whereNull('deleted_at').orderBy('created_at', 'desc')

    if (search) {
      query.where((q) => {
        q.whereILike('email', `%${search}%`)
          .orWhereILike('first_name', `%${search}%`)
          .orWhereILike('last_name', `%${search}%`)
      })
    }

    return query.paginate(page, perPage)
  }

  static async show(id: string): Promise<Partner> {
    const partner = await Partner.query().whereNull('deleted_at').where('id', id).first()

    if (!partner) {
      throw new AppError(AppError.NOT_FOUND, 'Partner not found')
    }

    return partner
  }

  static async create(payload: CreatePayload): Promise<Partner> {
    const fields = Pick(toCamel(payload), Partner.fillable)
    return Partner.create(fields)
  }

  static async update(id: string, payload: UpdatePayload): Promise<Partner> {
    const partner = await this.show(id)
    const fields = Pick(toCamel(payload), Partner.fillable)

    // Don't blank-out password by accident
    if (!fields.password) delete (fields as any).password

    partner.merge(fields)
    await partner.save()
    return partner
  }

  static async softDelete(id: string, currentPartnerId: string) {
    if (id === currentPartnerId) {
      throw new AppError(AppError.BAD_REQUEST, 'You cannot delete your own account')
    }

    const partner = await this.show(id)
    partner.deletedAt = DateTime.now()
    await partner.save()
  }

  static async ensureDirectorExists() {
    const count = await Partner.query()
      .whereNull('deleted_at')
      .where('role', PartnerRoleEnum.SYSTEM_DIRECTOR)
      .count('* as total')

    if ((count[0] as any).$extras.total <= 0) {
      throw new AppError(
        AppError.CONFLICT,
        'At least one SYSTEM_DIRECTOR must exist. Demote or delete another partner instead.'
      )
    }
  }
}
