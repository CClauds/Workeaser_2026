export enum TransactionCategory {
  ADVERTISING = "Advertising",
  BANK = "Bank",
  CAR = "Car",
  CONTRACTORS = "Contractors",
  INSURANCE = "Insurance",
  LEGAL = "Legal",
  MEALS = "Mels",
  OFFICE = "Office",
  OTHER = "Other",
  RENT = "Rent",
  REPAIRS = "Repairs",
  SCHOOL = "School",
  TAXES = "Taxes",
  TRAVEL = "Travel",
  UNCATEGORIZED = "Uncategorizes",
  UTILITIES = "Utilities",
  VIRTUAL_OFFICE = "Virtual Office",
  MEETING_ROOM = "Meeting Room",
  SHARED_PRIVATE_DESK = "Open Desk",
  SHARED_PRIVATE_ROOM = "Private Room",
  OTHERS = "Others",
}

export enum TransationFilter {
  NEW = "Reconcile",
  RECORDED = "Recorded",
  VOIDED = "Voided",
}

export enum InvoiceStatusEnum {
  OVERDUE = "Overdue",
  SENT = "Sent",
  VIEWED = "Viewed",
  PARTLY_PAID = "Partly Paid",
  FULLY_PAID = "Fully Paid",
  DEPOSITED = "Deposited",
  PARTLY_REFUNDED = "Partly Refunded",
  FULLY_REFUNDED = "Fully Refunded",
}

export enum InvoiceActionsEnum {
  CAPTURE_PAYMENT = "CAPTURE PAYMENT",
  RECEIVE_PAYMENT = "RECEIVE PAYMENT",
  REFUND_PAYMENT = "REFUND PAYMENT",
}
