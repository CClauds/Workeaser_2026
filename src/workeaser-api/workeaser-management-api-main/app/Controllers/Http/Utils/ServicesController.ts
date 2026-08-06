import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import Service from 'App/Models/Service';
import { responseWithSuccess } from 'App/Utils/ResponseApi';

export default class ServicesController {
  async index({ response }: HttpContextContract) {
    const services = await Service.all();
    return responseWithSuccess(response, services);
  }
}
