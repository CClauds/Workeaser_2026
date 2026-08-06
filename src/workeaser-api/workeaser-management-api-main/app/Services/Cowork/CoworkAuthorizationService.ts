import User from 'App/Models/User';
import CoworkUser from 'App/Models/CoworkUser';
import CoworkModule from 'App/Models/CoworkModule';
import CoworkUserModule from 'App/Models/CoworkUserModule';

export default class CoworkAuthorizationService {
  static async userHasPermissionToAccessModule(
    userId: number,
    modules?: string[]
  ): Promise<boolean> {
    if (!modules) {
      return false;
    }

    const user = await User.findOrFail(userId);
    await user.load('coworkUser');

    const modulesId = (await CoworkModule.query().whereIn('slug', modules)).map(
      (module) => module.id
    );

    const searchUserModules = await CoworkUserModule.query()
      .where('cowork_user_id', user.coworkUser.id)
      .whereIn('cowork_module_id', modulesId)
      .count('* as total');

    if (searchUserModules[0].$extras.total) {
      return true;
    }

    return false;
  }

  static async setModulesPermissionToUser(
    userId: number,
    coworkAccountId: number,
    modulesId: number[]
  ) {
    const coworkUser = await CoworkUser.query()
      .where('user_id', userId)
      .where('cowork_account_id', coworkAccountId)
      .firstOrFail();

    await coworkUser.related('coworkModules').sync(modulesId || []);
  }
}
