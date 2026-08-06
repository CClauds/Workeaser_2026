import { AxiosError } from 'axios';

export default class AppError extends Error {
  static BAD_REQUEST: number = 400;
  static VALIDATION_FAIL: number = 400;
  static UNAUTHORIZED: number = 401;
  static FORBIDDEN: number = 403;
  static NOT_FOUND: number = 404;
  static LOGIC_ERROR: number = 500;
  static INVALID_COWORK: number = 406;

  status: number;

  constructor(status = 500, ...params) {
    super(...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }

    this.status = status;
    this.name = 'AppError';
  }
}

export class PhotoError extends Error {
  static BAD_REQUEST: number = 400;
  static VALIDATION_FAIL: number = 400;
  static UNAUTHORIZED: number = 401;
  static FORBIDDEN: number = 403;
  static NOT_FOUND: number = 404;
  static LOGIC_ERROR: number = 500;
  code: string;
  status: number;
  messages: string;

  constructor(status = 500, messages) {
    super(messages);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PhotoError);
    }

    this.status = status;
    this.code = 'INVALID_PHOTO';
    this.messages = messages;
  }
}

export class BoldSignError extends Error {
  static BAD_REQUEST: number = 400;
  static VALIDATION_FAIL: number = 400;
  static UNAUTHORIZED: number = 401;
  static FORBIDDEN: number = 403;
  static NOT_FOUND: number = 404;
  static CONFLICT: number = 409;
  static LOGIC_ERROR: number = 500;

  status: number;
  code: string;
  message: string;

  constructor(error: AxiosError) {
    super(error.code);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BoldSignError);
    }

    if (error.message) {
      this.status = 400;
      this.message = error.message || 'An unexpected error happens, we are already working on it.';
      this.code = error.code || 'BOLDSIGN_ERROR';
      return;
    }

    this.status = error?.response?.status || 500;
    this.message =
      (error?.response?.data as any).error &&
      (error?.response?.data as any).error === 'Invalid signer Email ID'
        ? 'You already sign this contract.'
        : 'An unexpected error happens, we are already working on it.';

    this.code = 'BOLD_SIGN_ERROR';
  }
}
