/*
|--------------------------------------------------------------------------
| Http Exception Handler
|--------------------------------------------------------------------------
|
| AdonisJs will forward all exceptions occurred during an HTTP request to
| the following class. You can learn more about exception handling by
| reading docs.
|
| The exception handler extends a base `HttpExceptionHandler` which is not
| mandatory, however it can do lot of heavy lifting to handle the errors
| properly.
|
*/

import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler';
import Logger from '@ioc:Adonis/Core/Logger';
import { responseWithError } from 'App/Utils/ResponseApi';

export default class ExceptionHandler extends HttpExceptionHandler {
  protected ignoreCodes = ['E_ROUTE_NOT_FOUND'];

  protected statusPages = {
    '404': 'errors/not-found',
    '500..599': 'errors/server-error'
  };

  constructor() {
    super(Logger);
  }

  public async handle(error: any, ctx: HttpContextContract) {
    if (error.code === 'E_VALIDATION_FAILURE') {
      return ctx.response.status(400).send({
        status: 'ERROR',
        error: {
          code: 'VALIDATION_ERROR',
          message: error.messages.errors
        }
      });
    }

    ctx.logger.warn(
      {
        method: ctx.request.method(),
        url: ctx.request.url(),
        time: new Date(),
        by: {
          userId: ctx.auth.user?.id
        },
        err: new Error(error)
      },
      'Erro handling'
    );

    responseWithError(ctx.response, error.code, error.message, error.status, error.stack); // , error.stack
  }
}
