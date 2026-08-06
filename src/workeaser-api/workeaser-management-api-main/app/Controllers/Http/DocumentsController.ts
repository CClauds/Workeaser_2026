import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { responseWithError, responseWithSuccess } from 'App/Utils/ResponseApi';
import { extname } from 'path';
import AppError from 'App/Utils/AppError';
import Drive from '@ioc:Adonis/Core/Drive';
import Document from 'App/Models/Document';
import LogService from 'App/Services/LogService';
import { sanitizeRelativePath, safeRandomName } from 'App/Utils/SafeFilename';

const DOC_EXTS = ['pdf', 'jpg', 'jpeg', 'png', 'gif'] as const;

export default class DocumentsController {
  async show({ request, response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      // Lote 5b: sanitize path-from-user antes de qualquer Drive.getStream
      const rawPath = request.param('*').join('/');
      const location = sanitizeRelativePath(rawPath, { allowedExtensions: DOC_EXTS });
      if (!location) {
        throw new AppError(AppError.BAD_REQUEST, 'Invalid document path');
      }

      const document = await Document.query().where('file', location).first();
      if (!document) {
        throw new AppError(AppError.NOT_FOUND, 'File not found');
      }

      const { size } = await Drive.getStats(`documents/${location}`);
      const stream = await Drive.getStream(`documents/${location}`);

      response.type(extname(`documents/${location}`));
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
      const document = request.file('document', {
        size: '2mb',
        extnames: ['pdf', 'jpg', 'png', 'gif']
      });

      if (!document || !document.isValid) {
        return document?.errors;
      }

      // Lote 5b: filename 100% backend-generated (UUID + ext validada).
      const fileName = safeRandomName(document.subtype, DOC_EXTS);

      await document.moveToDisk(`./documents`, { name: fileName });

      const newDocument = await Document.create({
        userId: user?.id,
        file: fileName
      });

      await LogService.create(auth.user as any, 'DOCUMENTS', 'CREATE', newDocument.id);

      responseWithSuccess(response, newDocument);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async delete({ request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const rawPath = request.param('*').join('/');
      const filename = sanitizeRelativePath(rawPath, { allowedExtensions: DOC_EXTS });
      if (!filename) {
        throw new AppError(AppError.BAD_REQUEST, 'Invalid document path');
      }

      const user = auth.user;
      const document = await Document.query().where('file', filename).first();

      if (document && document.userId === user?.id) {
        await document.softDelete();
        await LogService.create(auth.user as any, 'DOCUMENTS', 'CREATE', document.id);
        responseWithSuccess(response);
      } else {
        throw new AppError(AppError.LOGIC_ERROR, 'An error occurred while deleting the document.');
      }
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }
}
