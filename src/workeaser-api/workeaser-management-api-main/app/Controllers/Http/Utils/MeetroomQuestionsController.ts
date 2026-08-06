import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { responseWithError, responseWithSuccess } from 'App/Utils/ResponseApi';
import MeetroomQuestions from 'App/Models/MeetroomQuestion';

export default class MeetroomQuestionsController {
  async index({ response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const questions = await MeetroomQuestions.all();
      return responseWithSuccess(response, questions);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }
}
