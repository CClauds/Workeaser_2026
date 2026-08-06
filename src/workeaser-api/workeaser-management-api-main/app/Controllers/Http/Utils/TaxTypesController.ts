import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { responseWithError, responseWithSuccess } from 'App/Utils/ResponseApi';
import { TaxTypesEnum } from 'Contracts/enums';

export default class TaxTypesController {
  async index({ response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const types = [
        { slug: TaxTypesEnum.CITY_TAX, name: 'City Tax' },
        { slug: TaxTypesEnum.COMPANY_FEE, name: 'Company Fee' },
        { slug: TaxTypesEnum.FEDERAL_TAX, name: 'Federal Tax' },
        { slug: TaxTypesEnum.STATE_TAX, name: 'State Tax' },
        { slug: TaxTypesEnum.OTHERS, name: 'Others' }
      ];

      return responseWithSuccess(response, types);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }
}
