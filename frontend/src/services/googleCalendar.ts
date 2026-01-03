import { CalendarEvent } from '../types';

// Google Calendar API configuration
const GOOGLE_CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';

interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
}

interface GoogleCalendarListResponse {
  items: GoogleCalendarEvent[];
  nextPageToken?: string;
}

export class GoogleCalendarService {
  private accessToken: string | null = null;

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    if (!this.accessToken) {
      throw new Error('Access token not set');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Google Calendar API error: ${response.status}`);
    }

    return response.json();
  }

  async getEvents(
    calendarId: string = 'primary',
    timeMin?: Date,
    timeMax?: Date
  ): Promise<CalendarEvent[]> {
    const params = new URLSearchParams({
      singleEvents: 'true',
      orderBy: 'startTime',
    });

    if (timeMin) {
      params.append('timeMin', timeMin.toISOString());
    }
    if (timeMax) {
      params.append('timeMax', timeMax.toISOString());
    }

    const url = `${GOOGLE_CALENDAR_API_BASE}/calendars/${encodeURIComponent(
      calendarId
    )}/events?${params}`;

    const data: GoogleCalendarListResponse = await this.fetchWithAuth(url);

    return data.items.map((event) => this.transformEvent(event));
  }

  async getUpcomingEvents(days: number = 30): Promise<CalendarEvent[]> {
    const timeMin = new Date();
    const timeMax = new Date();
    timeMax.setDate(timeMax.getDate() + days);

    return this.getEvents('primary', timeMin, timeMax);
  }

  private transformEvent(googleEvent: GoogleCalendarEvent): CalendarEvent {
    const startAt = googleEvent.start.dateTime
      ? new Date(googleEvent.start.dateTime)
      : new Date(googleEvent.start.date!);

    const endAt = googleEvent.end.dateTime
      ? new Date(googleEvent.end.dateTime)
      : new Date(googleEvent.end.date!);

    return {
      id: googleEvent.id,
      title: googleEvent.summary || '(No title)',
      startAt,
      endAt,
      memo: googleEvent.description,
      isFromGoogle: true,
      isShared: false, // Default to private, user will swipe to share
      createdBy: 'google',
      createdAt: new Date(),
    };
  }

  async createEvent(
    event: Partial<CalendarEvent>,
    calendarId: string = 'primary'
  ): Promise<CalendarEvent> {
    const googleEvent = {
      summary: event.title,
      description: event.memo,
      start: {
        dateTime: event.startAt?.toISOString(),
      },
      end: {
        dateTime: event.endAt?.toISOString(),
      },
    };

    const url = `${GOOGLE_CALENDAR_API_BASE}/calendars/${encodeURIComponent(
      calendarId
    )}/events`;

    const data = await this.fetchWithAuth(url, {
      method: 'POST',
      body: JSON.stringify(googleEvent),
    });

    return this.transformEvent(data);
  }

  async updateEvent(
    eventId: string,
    updates: Partial<CalendarEvent>,
    calendarId: string = 'primary'
  ): Promise<CalendarEvent> {
    const googleEvent: Partial<GoogleCalendarEvent> = {};

    if (updates.title) googleEvent.summary = updates.title;
    if (updates.memo) googleEvent.description = updates.memo;
    if (updates.startAt) {
      googleEvent.start = { dateTime: updates.startAt.toISOString() };
    }
    if (updates.endAt) {
      googleEvent.end = { dateTime: updates.endAt.toISOString() };
    }

    const url = `${GOOGLE_CALENDAR_API_BASE}/calendars/${encodeURIComponent(
      calendarId
    )}/events/${eventId}`;

    const data = await this.fetchWithAuth(url, {
      method: 'PATCH',
      body: JSON.stringify(googleEvent),
    });

    return this.transformEvent(data);
  }

  async deleteEvent(
    eventId: string,
    calendarId: string = 'primary'
  ): Promise<void> {
    const url = `${GOOGLE_CALENDAR_API_BASE}/calendars/${encodeURIComponent(
      calendarId
    )}/events/${eventId}`;

    await this.fetchWithAuth(url, {
      method: 'DELETE',
    });
  }
}

export const googleCalendarService = new GoogleCalendarService();
