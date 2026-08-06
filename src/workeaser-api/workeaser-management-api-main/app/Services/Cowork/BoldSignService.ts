import { BoldSign } from 'App/Integrations/BoldSign/implemetation/BoldSign.impl';
import User from 'App/Models/User';

export default class BoldSignService {
  static async GetIdentityDetailByUser(user: User) {
    const boldSign = new BoldSign();
    return boldSign.GetIdentityDetails(user.email);
  }

  static async CreateIdentity(user: User) {
    const boldSign = new BoldSign();
    return boldSign.CreateIdentity({
      email: user.email,
      name: user.fullName
    });
  }

  static async ResendIdentityRequest(user: User) {
    const boldSign = new BoldSign();
    return boldSign.ResendIdentityRequest(user.email);
  }

  static async ResendDeclinedIdentity(user: User) {
    const boldSign = new BoldSign();
    return boldSign.ResendDeclinedIdentity(user.email);
  }

  static async ResendRevokedIdentity(user: User) {
    const boldSign = new BoldSign();
    await boldSign.DeleteIdentity(user.email);
    return boldSign.CreateIdentity({
      name: user.fullName,
      email: user.email
    });
  }
}
