import Log from 'App/Models/Log';
import User from 'App/Models/User';

interface MetadataObject {
  [key: string]: any;
}

export default class LogService {
  static async create(
    user: User,
    module_: string,
    action: string,
    identifier?: number,
    metadata?: MetadataObject
  ): Promise<void> {
    try {
      const log = new Log();

      log.userId = user.id;
      log.module = module_;
      log.action = action;

      if (identifier) {
        log.identifier = identifier;
      }

      if (metadata) {
        log.metadata = JSON.stringify(metadata);
      }

      await log.save();
    } catch (e) {}
  }
}
