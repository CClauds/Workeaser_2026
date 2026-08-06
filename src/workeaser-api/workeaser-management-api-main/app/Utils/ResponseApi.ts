import Env from '@ioc:Adonis/Core/Env';
import { ResponseContract } from '@ioc:Adonis/Core/Response';
import { ValidationException } from '@ioc:Adonis/Core/Validator';
import AppError, { PhotoError } from './AppError';

/**
 * Polish Lote (HF-POLISH-04): endurecimento do error wrapper.
 *
 * Princípios:
 *  - SEMPRE logar detalhe técnico no servidor (stack + message + url + user).
 *  - NUNCA retornar stack ao cliente em produção.
 *  - NUNCA retornar `error.message` ao cliente quando vier de `Error` cru em produção
 *    (poderia vazar "Cannot read property X of undefined", paths, queries SQL, etc.).
 *  - Padronizar resposta de erro: { status, error: { code, message } }.
 *  - Compatibilidade com chamadas legadas:
 *      responseWithError(response, errorObj)
 *      responseWithError(response, "CODE_STRING", "user msg")
 *      responseWithError(response, error.message)  // legado: tratado como INTERNAL_ERROR
 */

export function inDev<T>(value: T, fallback: T): T {
  if (Env.get('NODE_ENV', 'development') === 'development') {
    return value;
  }
  return fallback;
}

export function parseStack(stackStr?: string) {
  if (!stackStr || Env.get('NODE_ENV') !== 'development') {
    return null;
  }
  return stackStr
    .split('\n')
    .slice(1)
    .map((line) => line.trim().replace(/^at\s/, '').replace(process.cwd(), '.'));
}

export function responseWithSuccess(response: ResponseContract, data?: any) {
  if (typeof data === 'string') {
    data = { message: data };
  }
  return response.json({
    status: 'OK',
    result: data || null,
    error: null
  });
}

export function responseWithPagination(response: ResponseContract, content: any) {
  const result = content.toJSON();
  return response.json({
    status: 'OK',
    result: result.data || [],
    pagination: {
      page: result?.meta?.current_page,
      lastPage: result?.meta?.last_page,
      total: result?.meta?.total,
      perPage: result?.meta?.per_page
    },
    error: null
  });
}

export function responseFromAppError(response: ResponseContract, error: AppError) {
  return response.status(error.status).json({
    status: 'ERROR',
    error: {
      code: 'APP_ERROR',
      message: error.message,
      ...inDev({ stack: parseStack(error.stack || undefined) }, {})
    }
  });
}

function logServerError(response: ResponseContract, err: unknown) {
  // Log COMPLETO no servidor: stack, message, url, user, sempre.
  // Não envia esse detalhe ao cliente em produção.
  try {
    response.ctx?.logger.error(
      {
        by: { userId: response.ctx?.auth?.user?.id },
        err: err instanceof Error ? { message: err.message, stack: err.stack, name: err.name } : err,
      },
      `<- ${response.ctx?.request.method()}: ${response.ctx?.request.url()}`
    );
  } catch {
    // logger pode falhar se ctx ainda não está pronto — segue
  }
}

/**
 * Heurística: detecta se um "code" string parece ser na verdade uma message de erro
 * vinda de `responseWithError(response, error.message)`. Mensagens normalmente:
 *  - têm espaços
 *  - são longas (> 40 chars)
 *  - não são UPPER_SNAKE_CASE (códigos de erro convencionais)
 */
function looksLikeMessage(s: string): boolean {
  if (!s) return false;
  if (/^[A-Z][A-Z0-9_]+$/.test(s)) return false; // ex: VALIDATION_FAIL, INTERNAL_ERROR
  return s.length > 40 || /\s/.test(s);
}

export function responseWithError(
  ...args:
    | [response: ResponseContract, error: AppError | Error]
    | [response: ResponseContract, code: string, message?: string, statusCode?: number, stack?: any]
): void {
  const [response, code, message, statusCode, stack] = args;

  // 1) AppError — código curto, mensagem segura
  if (code instanceof AppError) {
    logServerError(response, code);
    return responseFromAppError(response, code);
  }

  // 2) ValidationException — devolve erros estruturados
  if (code instanceof ValidationException) {
    logServerError(response, code);
    return response.status(400).json({
      status: 'ERROR',
      error: {
        code: 'VALIDATION_ERROR',
        message: (code as any).messages?.errors ?? 'Validation failed'
      }
    });
  }

  // 3) PhotoError — devolve código específico, mensagem segura
  if (code instanceof PhotoError) {
    logServerError(response, code);
    return response.status(PhotoError.BAD_REQUEST).json({
      status: 'ERROR',
      error: {
        code: code.code,
        message: code.message
      }
    });
  }

  // 4) Error cru — nunca vazar message em produção
  if (code instanceof Error) {
    logServerError(response, code);
    return response.status(statusCode || 500).json({
      status: 'ERROR',
      error: {
        code: 'INTERNAL_ERROR',
        message: inDev(code.message, 'An error occurred. Try again.'),
        ...inDev({ stack: parseStack(code.stack || undefined) }, {})
      }
    });
  }

  // 5) Legado: caller passou error.message como string em vez de error
  if (typeof code === 'string' && looksLikeMessage(code)) {
    // Comportamento histórico vazava esse texto no `code`. Agora sanitizamos:
    // - em produção: devolve INTERNAL_ERROR + mensagem genérica
    // - em dev: preserva o texto para facilitar debug
    logServerError(response, new Error(`[legacy responseWithError] ${code}`));
    return response.status(statusCode || 500).json({
      status: 'ERROR',
      error: {
        code: 'INTERNAL_ERROR',
        message: inDev(code, 'An error occurred. Try again.')
      }
    });
  }

  // 6) Caminho canônico: caller passou code + message
  logServerError(response, { code, message, statusCode });
  return response.status(statusCode || 500).json({
    status: 'ERROR',
    error: {
      code,
      message: message || inDev(code, 'An error occurred. Try again.'),
      ...inDev({ stack: parseStack(stack || undefined) }, {})
    }
  });
}
