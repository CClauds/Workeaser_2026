import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { responseWithError, responseWithSuccess } from 'App/Utils/ResponseApi';
import Amenity from 'App/Models/Amenity';

export default class AmenitiesController {
  async index({ response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const amenities = await Amenity.all();
      return responseWithSuccess(response, amenities);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }
}
