export default class AppError extends Error {
  public static BAD_REQUEST: number = 400
  public static VALIDATION_FAIL: number = 400
  public static UNAUTHORIZED: number = 401
  public static FORBIDDEN: number = 403
  public static NOT_FOUND: number = 404
  public static CONFLICT: number = 409
  public static LOGIC_ERROR: number = 500

  public status: number

  constructor(status = 500, ...params) {
    super(...params)

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }

    this.status = status
    this.name = 'AppError'
  }
}
