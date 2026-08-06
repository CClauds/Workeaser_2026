import User from 'App/Models/User';
import CoworkUser from 'App/Models/CoworkUser';
import { CoworkUserRoleEnum } from 'Contracts/enums';

export default class CoworkService {
  static async getCoworkManagers(coworkAccountId: number) {
    const coworkUsers = await CoworkUser.query()
      .where('cowork_account_id', coworkAccountId)
      .where('role', CoworkUserRoleEnum.MANAGER);

    const coworkUsersId = coworkUsers.map((coworkUser) => coworkUser.userId);

    const users: User[] = await User.query().whereIn('id', coworkUsersId);

    return users;
  }

  static async getCoworkEmployees(coworkAccountId: number) {
    const coworkUsers = await CoworkUser.query()
      .where('cowork_account_id', coworkAccountId)
      .where('role', CoworkUserRoleEnum.EMPLOYEE);

    const coworkUsersId = coworkUsers.map((coworkUser) => coworkUser.userId);

    const users = await User.query().whereIn('id', coworkUsersId);

    return users;
  }
}
