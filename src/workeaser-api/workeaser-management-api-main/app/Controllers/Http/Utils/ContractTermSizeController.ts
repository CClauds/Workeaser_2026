import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { responseWithError, responseWithSuccess } from 'App/Utils/ResponseApi';
import { ContractTermEnum } from 'Contracts/enums';

export default class ContractTermSizeController {
  async index({ response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const sizes = [
        { slug: ContractTermEnum.MONTH_1, name: '1 Month' },
        { slug: ContractTermEnum.MONTH_3, name: '3 Months' },
        { slug: ContractTermEnum.MONTH_6, name: '6 Months' },
        { slug: ContractTermEnum.YEAR_1, name: '1 Year' },
        { slug: ContractTermEnum.YEAR_2, name: '2 Years' },
        { slug: ContractTermEnum.YEAR_3, name: '3 Years' }
      ];

      return responseWithSuccess(response, sizes);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }
}
