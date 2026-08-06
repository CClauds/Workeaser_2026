import { AuthContract } from '@ioc:Adonis/Addons/Auth'
import AppError from 'App/Utils/Errors'

interface AccountForm {
  email: string
  password: string
}

export default class AuthService {
  private auth: AuthContract
  constructor(contract: AuthContract) {
    this.auth = contract
  }

  public async login(data: AccountForm) {
    try {
      const token = await this.auth.use('api').attempt(data.email, data.password, {
        expiresIn: '1days',
      })

      const response = {
        ...token.toJSON(),
        user: token.user.toJSON(),
      }

      return response
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }

      throw new AppError(AppError.UNAUTHORIZED, 'Email or password is incorrect')
    }
  }
}
