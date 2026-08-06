export enum ServiceTypeEnum {
  OPEN_DESK = "Open Desk",
  VIRTUAL_OFFICE = "Virtual Office",
  PRIVATE_ROOM = "Private Room",
  MEETING_ROOM = "Meeting Room",
  TOUR = "Tour",
  DAY_PASS = "Day Pass",
}

export enum ServicesSlugEnum {
  OPEN_DESK = "Open Desk",
  VIRTUAL_OFFICE = "Virtual Office",
  PRIVATE_ROOM = "Private Room",
  MEETING_ROOM = "Meeting Room",
}

export enum ActivityTypeEmum {
  MAILBOX = "Mailbox",
}

export enum TermSizeEnum {
  MONTH_1 = "1 MONTH",
  MONTH_3 = "3 MONTHS",
  MONTH_6 = "6 MONTHS",
  YEAR_1 = "1 YEAR",
  YEAR_2 = "2 YEARS",
  YEAR_3 = "3 YEARS",
}

export enum ServicesAbbrEnum {
  VIRTUAL_OFFICE = "VO",
  MEETING_ROOM = "MR",
  OPEN_DESK = "OD",
  PRIVATE_ROOM = "PR",
}
export enum ServicesUrlEnum {
  VIRTUAL_OFFICE = "virtual-office",
  MEETING_ROOM = "meeting-room",
  OPEN_DESK = "open-desk",
  PRIVATE_ROOM = "private-room",
}

export enum ServicesNameEnum {
  VIRTUAL_OFFICE = "Virtual Office",
  MEETING_ROOM = "Meeting Room",
  OPEN_DESK = "Open Desk",
  PRIVATE_ROOM = "Private Room",
  virtual_office = "Virtual Office",
  meeting_room = "Meeting Room",
  open_desk = "Open Desk",
  private_room = "Private Room",
}

export enum RenewalActionEnum {
  RENEWAL = "Renewal",
  CANCELATION = "Cancelation",
}

export enum BookingStatusEnum {
  SOLICITED = "Solicited",
  APPROVED = "Approved",
  REJECTED = "Rejected",
  WAITING_PAYMENT = "Waiting Payment",
}

export enum BookingsStatusColorEnum {
  SOLICITED = "gray",
  ACCEPTED = "green",
  REJECTED = "red",
}

export enum PaymentMethodsEnum {
  BENEFIT = "User Membership Benefit",
  BILLING = "Add to the Billing Cycle",
  CAPTURE = "Capture Payment",
  COURTESY = "Courtesy",
  PAY_SPACE = "Pay at the Space",
}

export enum InvoiceActionsEnum {
  CAPTURE_PAYMENT = "Capture Payment",
  RECEIVE_PAYMENT = "Receive Payment",
  REFUND_PAYMENT = "Refund Payment",
}

export enum InvoiceStatusColorEnum {
  OVERDUE = "red",
  OPEN = "gray",
  SENT = "gray",
  VIEWED = "gray",
  PARTLY_PAID = "yellow",
  FULLY_PAID = "green",
  DEPOSITED = "green",
  PARTLY_REFUNDED = "blue",
  FULLY_REFUNDED = "blue",
}

export enum InvoiceStatusEnum {
  OVERDUE = "Overdue",
  OPEN = "Open",
  SENT = "Sent",
  VIEWED = "Viewed",
  PARTLY_PAID = "Partly Paid",
  FULLY_PAID = "Fully Paid",
  DEPOSITED = "Deposited",
  PARTLY_REFUNDED = "Partly Refunded",
  FULLY_REFUNDED = "Fully Refunded",
}

export enum MailboxActionsEnum {
  HOLDING = "Holding",
  TRASHED = "Trashed",
  COLLECTED = "Collected",
  FORWARDED = "Forwarded",
}
export enum MailboxStatusEnum {
  HOLDING = "Holding",
  VIEWED = "Viewed",
  TRASHED = "Trashed",
  COLLECTED = "Collected",
  PICK_UP = "I will pick it up",
  FORWARDED = "Forwarded",
  HOLD_LOCATION = "Hold at location",
  TRASH = "You can trash it",
  FORWARD = "Forward it to me",
}

export enum PaymentStatusEnum {
  SUCCEEDED = "Success",
  PENDING = "Pending",
  FAILED = "Failed",
  REFUNDED = "Refunded",
  PARTLY_REFUNDED = "Partly Refunded",
}

export enum ClientMailboxStatusEnum {
  HOLD_LOCATION = "Hold at location",
  PICK_UP = "I will pick it up",
  TRASH = "You can trash it",
  FORWARD = "Forward it to me",
}

export enum ContractStatusEnum {
  CREATED = "Created",
  REQUESTED_PAYMENT = "Awaiting payment",
  PAYMENT_MADE = "Payed",
  CONTRACT_SENT = "Sent",
  SIGNED = "Signed",
  CANCELED = "Canceled",
  ACTIVE = "Active",
  INACTIVE = "Inactive",
  SIGN_BY_CLIENT = "Signed by Client",
  SIGN_BY_COWORK = "Signed By Cowork",
}

export enum AmenitiesIconsEnum {
  bike = 1,
  coffee,
  wheelChair,
  kitchen,
  microwave,
  tv,
  mothersRoom,
  restaurante,
  outdoorSpace,
  parking,
  petFriendly,
  phone,
  privateArea,
  refrigerator,
  printer,
  shower,
  desk,
  clock,
}

export enum DealsEnum {
  NEW_OPPORTUNITY = "New Opportunity",
  CLOSED_DEAL = "Closed Deal",
  REJECTED_DEAL = "Rejected Deal",
}
export enum DealsColorEnum {
  NEW_OPPORTUNITY = "gray",
  CLOSED_DEAL = "green",
  REJECTED_DEAL = "red",
}

export enum PipelineStatusEnum {
  OPPORTUNITY = "opportunity",
  CONTACTED = "contacted",
  QUOTED = "quoted",
  CONVERTED = "converted",
  REQUESTED = "requested",
}

export enum PipelineStatusColortEnum {
  OPPORTUNITY = "gray",
  CONTACTED = "yellow",
  QUOTED = "blue",
  CONVERTED = "green",
  REQUESTED = "red",
}
