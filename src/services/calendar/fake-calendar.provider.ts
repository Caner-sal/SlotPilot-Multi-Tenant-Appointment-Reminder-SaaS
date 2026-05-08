import type { CalendarProvider, CalendarEvent, CalendarResult } from "./calendar-provider.interface";

export class FakeCalendarProvider implements CalendarProvider {
  async createEvent(_calendarId: string, event: CalendarEvent, _accessToken: string): Promise<CalendarResult> {
    const eventId = `fake_cal_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    console.log(`[FAKE Calendar] createEvent: ${event.title} (${event.startTime.toISOString()}) | EventId: ${eventId}`);
    return { eventId, status: "created" };
  }

  async updateEvent(_calendarId: string, eventId: string, event: CalendarEvent, _accessToken: string): Promise<CalendarResult> {
    console.log(`[FAKE Calendar] updateEvent: ${eventId} | ${event.title}`);
    return { eventId, status: "updated" };
  }

  async deleteEvent(_calendarId: string, eventId: string, _accessToken: string): Promise<CalendarResult> {
    console.log(`[FAKE Calendar] deleteEvent: ${eventId}`);
    return { eventId, status: "deleted" };
  }

  getAuthUrl(state: string): string {
    return `http://localhost:3000/api/calendar/callback?fake=true&state=${encodeURIComponent(state)}`;
  }

  async exchangeCode(_code: string): Promise<{ accessToken: string; refreshToken?: string; expiresAt: Date }> {
    return {
      accessToken: `fake_access_${Date.now()}`,
      refreshToken: `fake_refresh_${Date.now()}`,
      expiresAt: new Date(Date.now() + 3600 * 1000),
    };
  }

  async refreshAccessToken(_refreshToken: string): Promise<{ accessToken: string; expiresAt: Date }> {
    return {
      accessToken: `fake_access_refreshed_${Date.now()}`,
      expiresAt: new Date(Date.now() + 3600 * 1000),
    };
  }
}
