export enum ServicesEnum {
  virtualoffices = 1,
  meetrooms,
  desks,
  rooms,
}

export enum RequestActionEnum {
  HOLD_LOCATION = "Hold at Location",
}
export enum MailboxStatusEnum {
  HOLDING = "Holding",
  TRASHED = "Trashed",
  COLLECTED = "Collected",
  FORWARDED = "Forwarded",
}

export enum PricingPeriodEnum {
  MONTH_1 = "1 MONTH",
  MONTH_3 = "3 MONTHS",
  MONTH_6 = "6 MONTHS",
  YEAR_1 = "1 YEAR",
  YEAR_2 = "2 YEARS",
  YEAR_3 = "3 YEARS",
}

export enum MeetingRoomType {
  DESK = "Desk",
  CALL = "Call",
  MEETING = "Meeting",
  CONFERENCE = "Conference",
  PRIVATE = "Private",
  AUDITORIUM = "Auditorium",
}
