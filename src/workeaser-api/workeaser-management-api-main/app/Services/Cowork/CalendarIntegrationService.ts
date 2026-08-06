import AppError from 'App/Utils/AppError';
import CalendarIntegration from 'App/Models/CalendarIntegration';

interface Integration {
  id: number;
  service: string;
}

export default class CalendarIntegrationService {
  static async list(coworkAccountId: number) {
    const integrations = await CalendarIntegration.query().where(
      'cowork_account_id',
      coworkAccountId
    );

    const integrationsFormatted: Integration[] = integrations.map((x) => ({
      id: x.id,
      service: x.service
    }));

    return integrationsFormatted;
  }

  static async delete(coworkAccountId: number, id: number): Promise<void> {
    const integration = await CalendarIntegration.query()
      .where('cowork_account_id', coworkAccountId)
      .where('id', id)
      .whereNull('deleted_at')
      .first();

    if (!integration) {
      throw new AppError(AppError.NOT_FOUND, 'Integration not found');
    }

    await integration.softDelete();
  }
}
