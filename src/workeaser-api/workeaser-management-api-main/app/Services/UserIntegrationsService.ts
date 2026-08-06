import UserIntegration from 'App/Models/UserIntegration';
import { IntegrationServiceEnum } from 'Contracts/enums';

export default class UserIntegrationService {
  static async attachKey(
    userId: number,
    service: IntegrationServiceEnum,
    key: string,
    value: string
  ): Promise<UserIntegration> {
    const integration = await UserIntegration.query()
      .where('id', userId)
      .where('service', service)
      .where('key', key)
      .first();

    if (integration) {
      integration.value = value;
      await integration.save();

      return integration;
    }

    const newIntegrationValue = await UserIntegration.create({
      userId,
      service,
      key,
      value
    });

    return newIntegrationValue;
  }

  static async getValue(
    userId: number,
    service: IntegrationServiceEnum,
    key: string
  ): Promise<String> {
    const integration = await UserIntegration.query()
      .where('id', userId)
      .where('service', service)
      .where('key', key)
      .first();

    if (integration) {
      return integration.value;
    }

    throw new Error('The user has no integration with the service');
  }
}
