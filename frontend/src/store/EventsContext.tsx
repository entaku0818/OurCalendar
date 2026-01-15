import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CalendarEvent } from '../types';
import { storageService, googleCalendarService } from '../services';

interface EventsContextType {
  events: CalendarEvent[];
  isLoading: boolean;
  isSyncing: boolean;
  addEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt'>) => void;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  toggleShared: (id: string) => void;
  getEventsForDate: (date: Date) => CalendarEvent[];
  getSharedEvents: () => CalendarEvent[];
  syncFromGoogle: (events: CalendarEvent[]) => void;
  fetchGoogleCalendarEvents: () => Promise<void>;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

// Generate unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load from storage on mount
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const savedEvents = await storageService.getEvents();
        if (savedEvents.length > 0) {
          setEvents(savedEvents);
        }
      } catch (error) {
        console.error('Failed to load events:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadEvents();
  }, []);

  // Save to storage when events change
  useEffect(() => {
    if (!isLoading) {
      storageService.setEvents(events);
    }
  }, [events, isLoading]);

  const addEvent = useCallback((eventData: Omit<CalendarEvent, 'id' | 'createdAt'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: generateId(),
      createdAt: new Date(),
    };
    setEvents((prev) => [...prev, newEvent]);
  }, []);

  const updateEvent = useCallback((id: string, updates: Partial<CalendarEvent>) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === id ? { ...event, ...updates } : event
      )
    );
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((event) => event.id !== id));
  }, []);

  const toggleShared = useCallback((id: string) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === id ? { ...event, isShared: !event.isShared } : event
      )
    );
  }, []);

  const getEventsForDate = useCallback(
    (date: Date) => {
      return events.filter(
        (event) => event.startAt.toDateString() === date.toDateString()
      );
    },
    [events]
  );

  const getSharedEvents = useCallback(() => {
    return events.filter((event) => event.isShared);
  }, [events]);

  const syncFromGoogle = useCallback((googleEvents: CalendarEvent[]) => {
    // Merge Google events with existing events
    setEvents((prev) => {
      // Remove old Google events and add new ones
      const localEvents = prev.filter((e) => !e.isFromGoogle);
      return [...localEvents, ...googleEvents];
    });
  }, []);

  const fetchGoogleCalendarEvents = useCallback(async () => {
    setIsSyncing(true);
    try {
      const accessToken = await storageService.getAccessToken();
      if (!accessToken) {
        console.log('No access token available for Google Calendar');
        return;
      }

      googleCalendarService.setAccessToken(accessToken);

      // Fetch events for the next 90 days
      const googleEvents = await googleCalendarService.getUpcomingEvents(90);
      console.log(`Fetched ${googleEvents.length} events from Google Calendar`);

      // Preserve isShared status from existing events
      setEvents((prev) => {
        const sharedStatusMap = new Map(
          prev.filter((e) => e.isFromGoogle).map((e) => [e.id, e.isShared])
        );

        const updatedGoogleEvents = googleEvents.map((e) => ({
          ...e,
          isShared: sharedStatusMap.get(e.id) ?? false,
        }));

        const localEvents = prev.filter((e) => !e.isFromGoogle);
        return [...localEvents, ...updatedGoogleEvents];
      });
    } catch (error) {
      console.error('Failed to fetch Google Calendar events:', error);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  return (
    <EventsContext.Provider
      value={{
        events,
        isLoading,
        isSyncing,
        addEvent,
        updateEvent,
        deleteEvent,
        toggleShared,
        getEventsForDate,
        getSharedEvents,
        syncFromGoogle,
        fetchGoogleCalendarEvents,
      }}
    >
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
}
