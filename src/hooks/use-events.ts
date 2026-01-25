import { useCallback, useEffect, useState } from 'react';
import type { SEvent } from '../entities/event/types';
import { http } from '../http';

interface UseEventsReturn {
  events: SEvent[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useEvents(): UseEventsReturn {
  const [events, setEvents] = useState<SEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await http
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setEvents(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch events';
      setError(new Error(errorMessage));
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    isLoading,
    error,
    refetch: fetchEvents,
  };
}
