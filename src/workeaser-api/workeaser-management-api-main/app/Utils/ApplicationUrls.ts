import Env from '@ioc:Adonis/Core/Env';

export default class ApplicationUrls {
  static AUTH = {
    LOGIN: `${Env.get('APP_URL')}/login`,
    VERIFY_EMAIL: `${Env.get('APP_URL')}/verify-email/`,
    LOST_PASSWORD_FORM: `${Env.get('APP_URL')}/lost-password/`,
    SIGNUP_EMPLOYEE_INVITE: `${Env.get('APP_URL')}/accept-invitation/`,
    SIGNUP_TEAM_MEMBER_INVITE: `${Env.get('APP_URL')}/accept-invite/`,
    NEW_CLIENT: `${Env.get('APP_URL')}/new-client/`,
    DEAL: `${Env.get('APP_URL')}/relationship/deals-and-opportunities/`,
    MEETING_ROOM_REQUEST: `${Env.get('APP_URL')}/relationship/agenda`,
    DAY_PASS_REQUEST: `${Env.get('APP_URL')}/relationship/agenda`,
    MAILBOX_COWORKER: `${Env.get('APP_URL')}/client/membership/`,
    MAILBOX_COWORKING: `${Env.get('APP_URL')}/relationship/client-management/mailbox/`,
    INVOICE_COWORKER: `${Env.get('APP_URL')}/invoice-payment/`,
    COWORKER_MEMBERSHIPS: `${Env.get('APP_URL')}/client/membership`
  };

  static PUB = {
    PHOTOS: `${Env.get('APP_URL')}/photos/`,
    INVOICE_SINGLE_VIEW_COWORKING: `${Env.get('APP_URL')}/finances/invoices/`,
    INVOICES: `${Env.get('APP_URL')}/invoice/`,
    PUBLIC_INVOICE: `${Env.get('APP_URL')}/invoice-payment/`
  };

  static STRIPE = {
    REFRESH_URL: `${Env.get('APP_URL')}/settings/global-settings`,
    RETURN_URL: `${Env.get('APP_URL')}/settings/global-settings?validation=succeed`
  };

  static SETTING = {
    CALENDAR_INTEGRATION: `${Env.get('APP_URL')}/settings/global-settings`
  };
}
