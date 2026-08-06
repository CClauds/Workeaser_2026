import User from 'App/Models/User'
import CoworkAccount from 'App/Models/CoworkAccount'
import ClientAccount from 'App/Models/ClientAccount'
import AppError from 'App/Utils/Errors'

interface ListOpts {
  page?: number
  perPage?: number
  search?: string
  type?: 'COWORKING' | 'CLIENT'
  sort?: 'name' | 'createdAt' | 'email'
  order?: 'asc' | 'desc'
}

export default class ClientsService {
  static async listCoworkings({
    page = 1,
    perPage = 20,
    search,
    sort = 'createdAt',
    order = 'desc',
  }: ListOpts) {
    const sortColumn =
      sort === 'name' ? 'name' : sort === 'email' ? 'email' : 'created_at'

    const query = CoworkAccount.query()
      .whereNull('deleted_at')
      .orderBy(sortColumn, order)

    if (search) {
      query.where((q) => {
        q.whereILike('name', `%${search}%`).orWhereILike('email', `%${search}%`)
      })
    }

    return query.paginate(page, perPage)
  }

  static async listClients({
    page = 1,
    perPage = 20,
    search,
    sort = 'createdAt',
    order = 'desc',
  }: ListOpts) {
    const sortColumn =
      sort === 'name' ? 'company_name' : sort === 'email' ? 'company_email' : 'created_at'

    const query = ClientAccount.query()
      .whereNull('deleted_at')
      .preload('user')
      .orderBy(sortColumn, order)

    if (search) {
      query.where((q) => {
        q.whereILike('company_name', `%${search}%`)
          .orWhereILike('company_email', `%${search}%`)
      })
    }

    return query.paginate(page, perPage)
  }

  static async showCoworking(id: number) {
    const account = await CoworkAccount.query()
      .whereNull('deleted_at')
      .where('id', id)
      .first()

    if (!account) {
      throw new AppError(AppError.NOT_FOUND, 'Coworking not found')
    }

    return account
  }

  static async showClient(id: number) {
    const account = await ClientAccount.query()
      .whereNull('deleted_at')
      .where('id', id)
      .preload('user')
      .first()

    if (!account) {
      throw new AppError(AppError.NOT_FOUND, 'Client not found')
    }

    return account
  }

  /**
   * Soft-suspends a user account by writing into `users.deleted_at`. Reversible
   * with `unsuspendUser`.
   */
  static async suspendUser(userId: number) {
    const user = await User.find(userId)

    if (!user) {
      throw new AppError(AppError.NOT_FOUND, 'User not found')
    }

    if (user.deletedAt) {
      throw new AppError(AppError.CONFLICT, 'User is already suspended')
    }

    await User.query().where('id', userId).update({ deleted_at: new Date() })
    return { id: userId, status: 'SUSPENDED' }
  }

  static async unsuspendUser(userId: number) {
    const user = await User.find(userId)

    if (!user) {
      throw new AppError(AppError.NOT_FOUND, 'User not found')
    }

    if (!user.deletedAt) {
      throw new AppError(AppError.CONFLICT, 'User is already active')
    }

    await User.query().where('id', userId).update({ deleted_at: null })
    return { id: userId, status: 'ACTIVE' }
  }
}
