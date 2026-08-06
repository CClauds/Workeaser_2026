/*
|--------------------------------------------------------------------------
| Validating Environment Variables
|--------------------------------------------------------------------------
|
| In this file we define the rules for validating environment variables.
| By performing validation we ensure that your application is running in
| a stable environment with correct configuration values.
|
| This file is read automatically by the framework during the boot lifecycle
| and hence do not rename or move this file to a different location.
|
*/

import Env from '@ioc:Adonis/Core/Env';

export default Env.rules({
  HOST: Env.schema.string({ format: 'host' }),
  PORT: Env.schema.number(),
  APP_KEY: Env.schema.string(),
  APP_NAME: Env.schema.string(),
  APP_URL: Env.schema.string(),
  API_URL: Env.schema.string(),
  DRIVE_DISK: Env.schema.enum(['local', 's3'] as const),
  NODE_ENV: Env.schema.enum(['development', 'production', 'testing'] as const),

  DB_CONNECTION: Env.schema.string(),
  MYSQL_HOST: Env.schema.string({ format: 'host' }),
  MYSQL_PORT: Env.schema.number(),
  MYSQL_USER: Env.schema.string(),
  MYSQL_PASSWORD: Env.schema.string.optional(),
  MYSQL_DB_NAME: Env.schema.string(),

  AWS_ACCESS_KEY: Env.schema.string(),
  AWS_ACCESS_SECRET: Env.schema.string(),
  AWS_REGION: Env.schema.string(),
  SES_MAIL_FROM: Env.schema.string(),
  SES_MAIL_FROM_NAME: Env.schema.string(),
  S3_BUCKET: Env.schema.string(),

  ITEMS_PER_PAGE: Env.schema.number(),

  GOOGLE_CLIENT_ID: Env.schema.string(),
  GOOGLE_CLIENT_SECRET: Env.schema.string(),
  GOOGLE_URI_REDIRECT: Env.schema.string(),

  EXCHANGE_CLIENT_ID: Env.schema.string(),
  EXCHANGE_CLIENT_SECRET: Env.schema.string(),
  EXCHANGE_REDIRECT_URI: Env.schema.string(),
  EXCHANGE_AUTHORITY: Env.schema.string(),

  DOCUSIGN_SANDBOX: Env.schema.boolean(),
  DOCUSIGN_BASE_URI: Env.schema.string(),
  DOCUSIGN_INTEGRATION_KEY: Env.schema.string(),
  DOCUSIGN_USER_ID: Env.schema.string(),
  DOCUSIGN_API_ACCOUNT_ID: Env.schema.string(),
  DOCUSIGN_PRIVATE_KEY: Env.schema.string.optional(),
  DOCUSIGN_PRIVATE_KEY_PATH: Env.schema.string.optional(),

  STRIPE_SECRET_KEY: Env.schema.string(),
  STRIPE_WEBHOOK_SECRET_KEY: Env.schema.string.optional(),

  PLAID_CLIENT_ID: Env.schema.string(),
  PLAID_SECRET_KEY: Env.schema.string(),
  PLAID_CLIENT_NAME: Env.schema.string(),
  AUTHORIZATION_ADOBE_SIGN: Env.schema.string(),
  ADOBE_SIGN_API: Env.schema.string(),
  CLIENTID_ADOBE_SIGN: Env.schema.string(),

  BOLD_SIGN_API: Env.schema.string.optional(),
  BOLD_SIGN_API_KEY: Env.schema.string.optional(),
  BOLD_SIGN_WEBHOOK_SECRET_KEY: Env.schema.string.optional(),

  CORS_ALLOWED_ORIGINS: Env.schema.string.optional()
});
