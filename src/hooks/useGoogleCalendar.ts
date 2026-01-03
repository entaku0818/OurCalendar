import { useState, useCallback } from 'react';
import { CalendarEvent } from '../types';
import { googleCalendarService } from '../services';

interface GoogleCalendarState {
  isLoading: boolean;
  error: string | null;
  events: CalendarEvent[];
}

export function useGoogleCalendar() {
  const [state, setState] = useState<GoogleCalendarState>({
    isLoading: false,
    error: null,
    events: [],
  });

  const setAccessToken = useCallback((token: string) => {
    googleCalendarService.setAccessToken(token);
  }, []);

  const fetchEvents = useCallback(async (days: number = 30): Promise<CalendarEvent[]> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const events = await googleCalendarService.getUpcomingEvents(days);
      setState({ isLoading: false, error: null, events });
      return events;
    } catch (error) {
      const message = error instanceof Error ? error.message : '予定の取得に失敗しました';
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
      return [];
    }
  }, []);

  const createEvent = useCallback(async (event: Partial<CalendarEvent>): Promise<CalendarEvent | null> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const newEvent = await googleCalendarService.createEvent(event);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        events: [...prev.events, newEvent],
      }));
      return newEvent;
    } catch (error) {
      const message = error instanceof Error ? error.message : '予定の作成に失敗しました';
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
      return null;
    }
  }, []);

  const updateEvent = useCallback(async (
    eventId: string,
    updates: Partial<CalendarEvent>
  ): Promise<CalendarEvent | null> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const updatedEvent = await googleCalendarService.updateEvent(eventId, updates);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        events: prev.events.map((e) => (e.id === eventId ? updatedEvent : e)),
      }));
      return updatedEvent;
    } catch (error) {
      const message = error instanceof Error ? error.message : '予定の更新に失敗しました';
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
      return null;
    }
  }, []);

  const deleteEvent = useCallback(async (eventId: string): Promise<boolean> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await googleCalendarService.deleteEvent(eventId);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        events: prev.events.filter((e) => e.id !== eventId),
      }));
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : '予定の削除に失敗しました';
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
      return false;
    }
  }, []);

  return {
    ...state,
    setAccessToken,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}
