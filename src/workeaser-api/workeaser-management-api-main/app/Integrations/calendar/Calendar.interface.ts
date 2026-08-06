import { DateTime } from 'luxon';
import { EventBookingTypes } from 'Contracts/enums';

export interface Credentials {
  token: string;
  refreshToken?: string;
  coworkAccountId: number;
}

export interface CalendarData {
  booking_type: EventBookingTypes;
  resource_id: number;
  summary: string;
  description: string;
  location_name: string;
  location_address: string;
  end_datetime: DateTime;
  start_datetime: DateTime;
  is_full_day: boolean;
  client_name: string;
  client_email: string;
}

export interface Calendar {
  insert(token: string, params: CalendarData): Promise<any>;
  update(token: string, eventId: string, params: CalendarData): Promise<any>;
  delete(token: string, eventId: string): Promise<any>;
  authorization(credentials: Credentials): Promise<string>;
}
