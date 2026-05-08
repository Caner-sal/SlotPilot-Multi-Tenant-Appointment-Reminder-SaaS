import type { CalendarProvider, CalendarEvent, CalendarResult } from "./calendar-provider.interface";

// Prerequisites:
// 1. Google Cloud project with Calendar API enabled
// 2. OAuth 2.0 credentials (Web application type)
// 3. GOOGLE_REDIRECT_URI added as authorized redirect URI in Google Cloud Console
// 4. Access tokens must be stored encrypted; this provider receives them already decrypted

interface GoogleTokenResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
}

interface GoogleEventResponse {
  id?: string;
  error?: { message: string };
}

export class GoogleCalendarProvider implements CalendarProvider {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.GOOGLE_CLIENT_ID ?? "";
    this.clientSecret = process.env.GOOGLE_CLIENT_SECRET ?? "";
    this.redirectUri = process.env.GOOGLE_REDIRECT_URI ?? "http://localhost:3000/api/calendar/callback";

    if (!this.clientId || !this.clientSecret) {
      throw new Error("Google Calendar credentials not configured (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET required)");
    }
  }

  getAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: "code",
      scope: "https://www.googleapis.com/auth/calendar.events",
      access_type: "offline",
      prompt: "consent",
      state,
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async exchangeCode(code: string): Promise<{ accessToken: string; refreshToken?: string; expiresAt: Date }> {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const data = await res.json() as GoogleTokenResponse;

    if (data.error || !data.access_token) {
      throw new Error(data.error_description ?? "Google token exchange failed");
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + (data.expires_in ?? 3600) * 1000),
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresAt: Date }> {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: "refresh_token",
      }),
    });

    const data = await res.json() as GoogleTokenResponse;

    if (data.error || !data.access_token) {
      throw new Error(data.error_description ?? "Google token refresh failed");
    }

    return {
      accessToken: data.access_token,
      expiresAt: new Date(Date.now() + (data.expires_in ?? 3600) * 1000),
    };
  }

  async createEvent(calendarId: string, event: CalendarEvent, accessToken: string): Promise<CalendarResult> {
    try {
      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(this.buildEventBody(event)),
        }
      );

      const data = await res.json() as GoogleEventResponse;

      if (!res.ok || data.error) {
        return { eventId: "", status: "failed", error: data.error?.message ?? "Google Calendar API error" };
      }

      return { eventId: data.id ?? "", status: "created" };
    } catch (err) {
      return { eventId: "", status: "failed", error: String(err) };
    }
  }

  async updateEvent(calendarId: string, eventId: string, event: CalendarEvent, accessToken: string): Promise<CalendarResult> {
    try {
      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(this.buildEventBody(event)),
        }
      );

      const data = await res.json() as GoogleEventResponse;

      if (!res.ok || data.error) {
        return { eventId: eventId, status: "failed", error: data.error?.message ?? "Google Calendar API error" };
      }

      return { eventId: data.id ?? eventId, status: "updated" };
    } catch (err) {
      return { eventId: eventId, status: "failed", error: String(err) };
    }
  }

  async deleteEvent(calendarId: string, eventId: string, accessToken: string): Promise<CalendarResult> {
    try {
      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (res.status === 204 || res.ok) {
        return { eventId, status: "deleted" };
      }

      const data = await res.json() as GoogleEventResponse;
      return { eventId, status: "failed", error: data.error?.message ?? "Google Calendar delete failed" };
    } catch (err) {
      return { eventId, status: "failed", error: String(err) };
    }
  }

  private buildEventBody(event: CalendarEvent) {
    return {
      summary: event.title,
      description: event.description,
      location: event.location,
      start: { dateTime: event.startTime.toISOString() },
      end: { dateTime: event.endTime.toISOString() },
      attendees: event.attendeeEmail ? [{ email: event.attendeeEmail }] : undefined,
    };
  }
}
