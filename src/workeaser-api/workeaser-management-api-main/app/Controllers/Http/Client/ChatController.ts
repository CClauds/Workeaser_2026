import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import ChatService from 'App/Services/Client/ChatService';
import AppError from 'App/Utils/AppError';
import { responseWithError, responseWithSuccess } from 'App/Utils/ResponseApi';
import ChatValidator from 'App/Validators/Client/Chat/ChatValidatorClient';
import MessageValidator from 'App/Validators/MessageValidator';

export default class ChatController {
  async index({ response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    try {
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const results = await ChatService.listChats(user);

      return responseWithSuccess(response, results);
    } catch (error) {
      return responseWithError(response, error);
    }
  }

  async newMessage({ params, request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const payload = await request.validate(MessageValidator);
    const user = auth.user;
    const chatId = params.uuid;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const newMessageData = await ChatService.newMessage(user, {
      message: payload.message,
      chat_uuid: chatId
    });

    return responseWithSuccess(response, newMessageData);
  }

  async lastMessages({ response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    try {
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const results = await ChatService.lastMessages(user);

      return responseWithSuccess(response, results);
    } catch (error) {
      return responseWithError(response, error);
    }
  }

  async firstOrCreateChat({ request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    try {
      const payload = await request.validate(ChatValidator);
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const newMessageData = await ChatService.firstOrCreateChat(user, payload);

      return responseWithSuccess(response, newMessageData);
    } catch (error) {
      return responseWithError(response, error);
    }
  }

  async showChatMessages({ params, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    try {
      const id = params.uuid;
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const newMessageData = await ChatService.showChatMessages(user, id);

      return responseWithSuccess(response, newMessageData);
    } catch (error) {
      return responseWithError(response, error);
    }
  }
}
