import Drive from '@ioc:Adonis/Core/Drive';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import Photo from 'App/Models/Photo';
import LogService from 'App/Services/LogService';
import AppError, { PhotoError } from 'App/Utils/AppError';
import { responseWithError, responseWithSuccess } from 'App/Utils/ResponseApi';
import { sanitizeRelativePath, safeRandomName } from 'App/Utils/SafeFilename';
import { extname } from 'path';

const PHOTO_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp'] as const;

export default class PhotosController {
  async show({ request, response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      // Lote 5b: sanitize path-from-user
      const rawPath = request.param('*').join('/');
      const location = sanitizeRelativePath(rawPath, { allowedExtensions: PHOTO_EXTS });
      if (!location) {
        throw new AppError(AppError.BAD_REQUEST, 'Invalid photo path');
      }

      const photo = await Photo.query().where('file', location).first();
      if (!photo) {
        throw new AppError(AppError.NOT_FOUND, 'File not found');
      }

      const { size } = await Drive.getStats(`photos/${location}`);
      const stream = await Drive.getStream(`photos/${location}`);

      response.type(extname(`photos/${location}`));
      response.header('content-length', size);

      return response.stream(stream);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async store({ request, response, auth }: HttpContextContract) {
    const user = auth.user;
    const photo = request.file('photo', {
      size: '4mb',
      extnames: ['jpg', 'png', 'gif']
    });

    if (!photo || !photo.isValid) {
      throw new PhotoError(400, photo?.errors.map((err) => err.message).join(''));
    }

    // Lote 5b: filename gerado pelo backend, nao confiar em photo.extname puro.
    const fileName = safeRandomName(photo.extname, PHOTO_EXTS);

    await photo.moveToDisk(`./photos`, { name: fileName });

    const newPhoto = await Photo.create({
      userId: user?.id,
      file: fileName
    });

    await LogService.create(auth.user as any, 'PHOTOS', 'CREATE', newPhoto.id);

    responseWithSuccess(response, newPhoto);
  }

  async delete({ request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const rawPath = request.param('*').join('/');
      const filename = sanitizeRelativePath(rawPath, { allowedExtensions: PHOTO_EXTS });
      if (!filename) {
        throw new AppError(AppError.BAD_REQUEST, 'Invalid photo path');
      }

      const user = auth.user;
      const photo = await Photo.query().where('file', filename).first();

      if (photo && photo.userId === user?.id) {
        await photo.softDelete();
        await LogService.create(auth.user as any, 'PHOTOS', 'CREATE', photo.id);
        responseWithSuccess(response);
      } else {
        throw new AppError(AppError.LOGIC_ERROR, 'An error occurred while deleting the photo.');
      }
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }
}
