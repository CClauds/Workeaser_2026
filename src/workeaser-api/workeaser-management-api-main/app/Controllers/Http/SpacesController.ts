import AppError from 'App/Utils/AppError';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import {
  responseWithError,
  responseWithPagination,
  responseWithSuccess
} from 'App/Utils/ResponseApi';
import SpacesService from 'App/Services/SpacesService';
import { ServicesEnum } from 'Contracts/enums';

export default class SpacesController {
  async list({ request, response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const requestParams = request.all();
      const page = request.input('page', 1);

      const results = await SpacesService.search(requestParams, page);

      return responseWithPagination(response, results);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async show({ response, params }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const { serviceType, id } = params;
      let serviceTypeFormatted;

      switch (serviceType) {
        case 'meeting-room':
          serviceTypeFormatted = ServicesEnum.MEETING_ROOM;
          break;
        case 'open-desk':
          serviceTypeFormatted = ServicesEnum.OPEN_DESK;
          break;
        case 'private-room':
          serviceTypeFormatted = ServicesEnum.PRIVATE_ROOM;
          break;
        case 'virtual-office':
          serviceTypeFormatted = ServicesEnum.VIRTUAL_OFFICE;
          break;
        default:
          throw new AppError(AppError.NOT_FOUND, 'Resource not found');
      }

      const record = await SpacesService.show(serviceTypeFormatted, id);

      return responseWithSuccess(response, record);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async showLocation({ response, params }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const id = params.id;
      const record = await SpacesService.showLocation(id);

      return responseWithSuccess(response, record);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async showVoBySlug({ response, params }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const slug = params.slug;
      const record = await SpacesService.showVoBySlug(slug);

      return responseWithSuccess(response, record);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async showMrBySlug({ response, params }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const slug = params.slug;

      const record = await SpacesService.showMrBySlug(slug);

      return responseWithSuccess(response, record);
    } catch (error) {
      return responseWithError(response, error);
    }
  }

  async showOdBySlug({ response, params }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const slug = params.slug;
      const record = await SpacesService.showOdBySlug(slug);

      return responseWithSuccess(response, record);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async showPrBySlug({ response, params }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const slug = params.slug;
      const record = await SpacesService.showPrBySlug(slug);

      return responseWithSuccess(response, record);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }
}
