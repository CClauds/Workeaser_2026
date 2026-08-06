import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { responseWithError, responseWithSuccess } from 'App/Utils/ResponseApi';
import { extname } from 'path';
import AppError from 'App/Utils/AppError';
import Drive from '@ioc:Adonis/Core/Drive';
import LogService from 'App/Services/LogService';
import Video from 'App/Models/Video';

export default class VideosController {
  async show({ request, response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const location = request.param('*').join('/');
      const video = await Video.query().where('file', location).first();

      if (!video) {
        throw new AppError(AppError.NOT_FOUND, 'File not found');
      }

      const { size } = await Drive.getStats(`videos/${location}`);
      const stream = await Drive.getStream(`videos/${location}`);

      response.type(extname(`videos/${location}`));
      response.header('content-length', size);

      return response.stream(stream);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async store({ request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;
      const video = request.file('video', {
        size: '20mb',
        extnames: ['mp4', 'avi', 'mov']
      });

      if (!video || !video.isValid) {
        return video?.errors;
      }

      const randomName =
        Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const fileName = `${randomName}_${Date.now()}.${video.extname}`;

      await video.moveToDisk(`./videos`, { name: fileName });

      const newVideo = await Video.create({
        userId: user?.id,
        file: fileName
      });

      await LogService.create(auth.user as any, 'VIDEOS', 'CREATE', newVideo.id);

      responseWithSuccess(response, newVideo);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async delete({ request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const filename = request.param('*').join('/');
      const user = auth.user;
      const video = await Video.query().where('file', filename).first();

      if (video && video.userId === user?.id) {
        await video.softDelete();
        await LogService.create(auth.user as any, 'VIDEOS', 'CREATE', video.id);
        responseWithSuccess(response);
      } else {
        throw new AppError(AppError.LOGIC_ERROR, 'An error occurred while deleting the video.');
      }
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }
}
