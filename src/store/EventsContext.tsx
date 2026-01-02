import React, { createContext, useContext, useState, useCallback } from 'react';
import { CalendarEvent } from '../types';

interface EventsContextType {
  events: CalendarEvent[];
  isLoading: boolean;
  addEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt'>) => void;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  toggleShared: (id: string) => void;
  getEventsForDate: (date: Date) => CalendarEvent[];
  getSharedEvents: () => CalendarEvent[];
  syncFromGoogle: (events: CalendarEvent[]) => void;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

// Generate unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
    // Merge Google events with existing events
    setEvents((prev) => {
      const existingIds = new Set(prev.filter((e) => e.isFromGoogle).map((e) => e.id));
      const newEvents = googleEvents.filter((e) => !existingIds.has(e.id));
      return [...prev, ...newEvents];
    });
    setIsLoading(false);
  }, []);

  return (
    <EventsContext.Provider
      value={{
        events,
        isLoading,
        addEvent,
        updateEvent,
        deleteEvent,
        toggleShared,
        getEventsForDate,
        getSharedEvents,
        syncFromGoogle,
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
