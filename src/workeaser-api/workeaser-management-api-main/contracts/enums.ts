export enum UserRoleEnum {
  ADMIN = 'ADMIN',
  COWORKING = 'COWORKING',
  CLIENT = 'CLIENT'
}

export enum CoworkUserRoleEnum {
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE'
}

export enum CoworkModulesEnum {
  LOCATIONS = 'LOCATIONS',
  SERVICES = 'SERVICES',
  RELATIONSHIP = 'RELATIONSHIP',
  FINANCES = 'FINANCES',
  REPORTS = 'REPORTS',
  ACCOUNT_SETTINGS = 'ACCOUNT_SETTINGS',
  VIRTUAL_OFFICE = 'VIRTUAL_OFFICE',
  MEETROOM = 'MEETROOM'
}

export enum ClientModulesEnum {
  BENEFITS_OVERVIEW = 'BENEFITS_OVERVIEW',
  PRODUCTS_SERVICES = 'PRODUCTS_SERVICES',
  BOOKING_SCHEDULE = 'BOOKING_SCHEDULE',
  MAILBOX_MANAGER = 'MAILBOX_MANAGER',
  PAYMENT_INVOICES = 'PAYMENT_INVOICES',
  SPACE_SUPPORT = 'SPACE_SUPPORT'
}

export enum ClientType {
  INDIVIDUAL = 'INDIVIDUAL',
  MANAGER = 'MANAGER',
  MEMBER = 'MEMBER'
}

export enum MeasurementTypeEnum {
  FEETS = 'FEETS',
  METERS = 'METERS'
}

export enum ToursStatusEnum {
  SOLICITED = 'SOLICITED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum DayPassStatusEnum {
  SOLICITED = 'SOLICITED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELED = 'CANCELED',
  WAITING_PAYMENT = 'WAITING_PAYMENT'
}

export enum DayPassUserTypeEnum {
  LEAD = 'LEAD',
  CLIENT = 'CLIENT'
}

export enum DayPassPaymentMethodEnum {
  CAPTURE = 'CAPTURE',
  BENEFIT = 'BENEFIT',
  COURTESY = 'COURTESY',
  PAY_SPACE = 'PAY_SPACE',
  WORKEASER_CREDIT = 'WORKEASER_CREDIT'
}

export enum DayPassSolicitedByEnum {
  CLIENT = 'CLIENT',
  COWORK = 'COWORK'
}

export enum LeadStatusEnum {
  QUOTED = 'QUOTED',
  REQUESTED = 'REQUESTED',
  CONVERTED = 'CONVERTED',
  CONTACTED = 'CONTACTED',
  OPPORTUNITY = 'OPPORTUNITY'
}

export enum ContractTermEnum {
  MONTH_1 = 'MONTH_1',
  MONTH_3 = 'MONTH_3',
  MONTH_6 = 'MONTH_6',
  YEAR_1 = 'YEAR_1',
  YEAR_2 = 'YEAR_2',
  YEAR_3 = 'YEAR_3'
}

export enum ContractPaymentStyleEnum {
  MONTHLY = 'MONTHLY',
  TOTAL = 'TOTAL'
}

export enum IntegrationServiceEnum {
  GOOGLE = 'GOOGLE',
  EXCHANGE = 'EXCHANGE',
  STRIPE = 'STRIPE',
  PLAID = 'PLAID'
}

export enum StripeIntegrationEnum {
  CUSTOMER_ID = 'CUSTOMER_ID'
}

export enum ContractStatusEnum {
  CREATED = 'CREATED',
  REQUESTED_PAYMENT = 'REQUESTED_PAYMENT',
  PAYMENT_MADE = 'PAYMENT_MADE',
  CONTRACT_SENT = 'CONTRACT_SENT',
  SIGNED = 'SIGNED',
  SIGN_BY_CLIENT = 'SIGN_BY_CLIENT',
  SIGN_BY_COWORK = 'SIGN_BY_COWORK',
  CANCELED = 'CANCELED',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export enum ServicesEnum {
  VIRTUAL_OFFICE = 'VIRTUAL_OFFICE',
  MEETING_ROOM = 'MEETING_ROOM',
  OPEN_DESK = 'OPEN_DESK',
  PRIVATE_ROOM = 'PRIVATE_ROOM'
}

export enum InvoiceStatusEnum {
  SENT = 'SENT',
  VIEWED = 'VIEWED',
  PARTLY_PAID = 'PARTLY_PAID',
  FULLY_PAID = 'FULLY_PAID',
  DEPOSITED = 'DEPOSITED',
  PARTLY_REFUNDED = 'PARTLY_REFUNDED',
  FULLY_REFUNDED = 'FULLY_REFUNDED',
  OVERDUE = 'OVERDUE'
}

export enum RefundType {
  FULL_REFUND = 'FULL_REFUND',
  PARTIAL_REFUND = 'PARTIAL_REFUND',
  NO_REFUND = 'NO_REFUND'
}

export enum TaxTypesEnum {
  CITY_TAX = 'CITY_TAX',
  STATE_TAX = 'STATE_TAX',
  FEDERAL_TAX = 'FEDERAL_TAX',
  COMPANY_FEE = 'COMPANY_FEE',
  OTHERS = 'OTHERS'
}

export enum RecurringTypeTaxEnum {
  CREATED = 'CREATED',
  OVERDUE = 'OVERDUE'
}

export enum TaxMethodsEnum {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED'
}

export enum CoworkSettingsEnum {
  RECURRING_INVOICE_CREATION = 'recurringInvoiceCreation',
  RECURRING_INVOICE_DUE_DATE = 'recurringInvoiceDueDate'
}

export enum MailboxCoworkingEnum {
  HOLDING = 'HOLDING',
  COLLECTED = 'COLLECTED',
  TRASHED = 'TRASHED',
  FORWARDED = 'FORWARDED'
}

export enum MailboxClientEnum {
  HOLD_LOCATION = 'HOLD_LOCATION',
  PICK_UP = 'PICK_UP',
  TRASH = 'TRASH',
  FORWARD = 'FORWARD'
}

export enum MailboxHistoryStatus {
  VIEWED = 'VIEWED'
}

export enum MeetroomQuestionSlugs {
  OFFICE_SUPPLIES = 'OFFICE_SUPPLIES',
  MULTIMEDIA_CONNECTORS = 'MULTIMEDIA_CONNECTORS',
  ADA_COMPLIANT = 'ADA_COMPLIANT',
  PRESENTATION_PROJECTOR = 'PRESENTATION_PROJECTOR',
  WHITEBOARD = 'WHITEBOARD',
  EAT_IN_THE_ROOM = 'EAT_IN_THE_ROOM',
  DRINK_IN_THE_ROOM = 'DRINK_IN_THE_ROOM'
}

export enum MeetroomTypesEnum {
  DESK = 'DESK',
  CALL = 'CALL',
  MEETING = 'MEETING',
  CONFERENCE = 'CONFERENCE',
  PRIVATE = 'PRIVATE',
  AUDITORIUM = 'AUDITORIUM'
}

export enum MeetroomRentalTimeframeEnum {
  MINUTES_15 = 'MINUTES_15',
  MINUTES_30 = 'MINUTES_30',
  HOURS_1 = 'HOURS_1'
}

export enum MeetroomMinimumRentalEnum {
  MINUTES_30 = 'MINUTES_30',
  HOURS_1 = 'HOURS_1',
  HOURS_2 = 'HOURS_2',
  HOURS_3 = 'HOURS_3',
  DAYS_1 = 'DAYS_1'
}

export enum WalletTypesEnum {
  CARD = 'CARD',
  BANK_ACCOUNT = 'BANK_ACCOUNT'
}

export enum PaymentTypesEnum {
  CARD = 'CARD',
  BANK_ACCOUNT = 'BANK_ACCOUNT',
  RECEIVED = 'RECEIVED'
}

export enum PaymentStatusEnum {
  SUCCEEDED = 'SUCCEEDED',
  PENDING = 'PENDING',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTLY_REFUNDED = 'PARTLY_REFUNDED'
}

export enum MeetingDiscountTypesEnum {
  NONE = 'NONE',
  FIXED = 'FIXED',
  PERCENTAGE = 'PERCENTAGE'
}

export enum MeetingStatusEnum {
  SOLICITED = 'SOLICITED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELED = 'CANCELED',
  WAITING_PAYMENT = 'WAITING_PAYMENT'
}

export enum MeetingPaymentMethodEnum {
  CAPTURE = 'CAPTURE',
  BILLING = 'BILLING',
  BENEFIT = 'BENEFIT',
  COURTESY = 'COURTESY',
  PAY_SPACE = 'PAY_SPACE'
}

export enum MeetingSolicitedByEnum {
  CLIENT = 'CLIENT',
  COWORK = 'COWORK'
}

export enum SpaceReserveInquireTypesEnum {
  CLOSED_DEAL = 'CLOSED_DEAL',
  REJECTED_DEAL = 'REJECTED_DEAL',
  NEW_OPPORTUNITY = 'NEW_OPPORTUNITY'
}

export enum NotificationTypeEnum {
  CLIENT = 'CLIENT',
  COWORK = 'COWORK'
}

export enum SearhAreaTypesEnum {
  MILES = 'MILES',
  KILOMETERS = 'KILOMETERS'
}

export enum OpenDeskTypeEnum {
  EXCLUSIVE = 'EXCLUSIVE',
  SHAREABLE = 'SHAREABLE'
}

export enum TransactionExpensesCategories {
  ADVERTISING = 'ADVERTISING',
  BANK = 'BANK',
  CAR = 'CAR',
  CONTRACTORS = 'CONTRACTORS',
  INSURANCE = 'INSURANCE',
  LEGAL = 'LEGAL',
  MEALS = 'MEALS',
  OFFICE = 'OFFICE',
  OTHER = 'OTHER',
  RENT = 'RENT',
  REPAIRS = 'REPAIRS',
  SCHOOL = 'SCHOOL',
  TAXES = 'TAXES',
  TRAVEL = 'TRAVEL',
  UNCATEGORIZED = 'UNCATEGORIZED',
  UTILITIES = 'UTILITIES'
}

export enum TransactionIncomeCategories {
  VIRTUAL_OFFICE = 'VIRTUAL_OFFICE',
  MEETING_ROOM = 'MEETING_ROOM',
  SHARED_PRIVATE_DESK = 'SHARED_PRIVATE_DESK',
  SHARED_PRIVATE_ROOM = 'SHARED_PRIVATE_ROOM',
  OTHERS = 'OTHERS'
}

export enum TransactionStatus {
  NEW = 'NEW',
  RECORDED = 'RECORDED',
  VOIDED = 'VOIDED'
}

export enum StripeExternalAccountTypes {
  BANK_ACCOUNT = 'BANK_ACCOUNT',
  CARD = 'CARD'
}

export enum EventBookingTypes {
  TOUR = 'TOUR',
  MEETING = 'MEETING',
  DAY_PASS = 'DAY_PASS'
}

export enum MembershipStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}
