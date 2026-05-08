export interface CalendarEvent {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  attendeeEmail?: string;
}

export interface CalendarResult {
  eventId: string;
  status: "created" | "updated" | "deleted" | "failed";
  error?: string;
}

export interface CalendarProvider {
  createEvent(calendarId: string, event: CalendarEvent, accessToken: string): Promise<CalendarResult>;
  updateEvent(calendarId: string, eventId: string, event: CalendarEvent, accessToken: string): Promise<CalendarResult>;
  deleteEvent(calendarId: string, eventId: string, accessToken: string): Promise<CalendarResult>;
  getAuthUrl(state: string): string;
  exchangeCode(code: string): Promise<{ accessToken: string; refreshToken?: string; expiresAt: Date }>;
  refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresAt: Date }>;
}
