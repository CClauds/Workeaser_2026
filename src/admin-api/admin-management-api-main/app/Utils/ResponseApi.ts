import Env from '@ioc:Adonis/Core/Env'
import { ResponseContract } from '@ioc:Adonis/Core/Response'
import { ValidationException } from '@ioc:Adonis/Core/Validator'
import AppError from './Errors'

function inDev<T>(value: T, fallback: T): T {
  return Env.get('NODE_ENV', 'development') === 'development' ? value : fallback
}

function parseStack(stack?: string) {
  if (!stack || Env.get('NODE_ENV') !== 'development') return undefined
  return stack
    .split('\n')
    .slice(1)
    .map((line) => line.trim().replace(/^at\s/, '').replace(process.cwd(), '.'))
}

export function responseWithSuccess(response: ResponseContract, data?: any) {
  if (typeof data === 'string') {
    data = { message: data }
  }

  return response.json({
    status: 'OK',
    result: data ?? null,
    error: null,
  })
}

export function responseWithPagination(response: ResponseContract, content: any) {
  const result = content.toJSON ? content.toJSON() : content

  return response.json({
    status: 'OK',
    result: result.data ?? [],
    pagination: {
      page: result?.meta?.current_page,
      lastPage: result?.meta?.last_page,
      total: result?.meta?.total,
      perPage: result?.meta?.per_page,
    },
    error: null,
  })
}

export function responseWithError(response: ResponseContract, error: any) {
  response.ctx?.logger.warn(
    {
      by: { partnerId: response.ctx?.auth.user?.id },
      error: error?.message || error,
    },
    `-> ${response.ctx?.request.method()}: ${response.ctx?.request.url()}`
  )

  if (error instanceof AppError) {
    return response.status(error.status).json({
      status: 'ERROR',
      error: {
        code: 'APP_ERROR',
        message: error.message,
        ...(inDev({ stack: parseStack(error.stack) }, {}) as Record<string, unknown>),
      },
    })
  }

  if (error instanceof ValidationException) {
    const ve = error as any
    return response.status(400).json({
      status: 'ERROR',
      error: {
        code: 'VALIDATION_ERROR',
        message: ve.messages?.errors ?? ve.message,
      },
    })
  }

  if (error instanceof Error) {
    return response.status(500).json({
      status: 'ERROR',
      error: {
        code: 'INTERNAL_ERROR',
        message: inDev(error.message, 'An error occurred. Try again.'),
        ...(inDev({ stack: parseStack(error.stack) }, {}) as Record<string, unknown>),
      },
    })
  }

  return response.status(500).json({
    status: 'ERROR',
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An error occurred. Try again.',
    },
  })
}
