import { useCallback, useEffect, useState } from 'react';
import type { SCatalogItem } from '../entities/catalog';
import { http } from '../http';

interface UseCatalogReturn {
  items: SCatalogItem[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useCatalog(): UseCatalogReturn {
  const [items, setItems] = useState<SCatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCatalog = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await http
        .from('catalog')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setItems((data as SCatalogItem[]) || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Не удалось загрузить каталог';
      setError(new Error(errorMessage));
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  return {
    items,
    isLoading,
    error,
    refetch: fetchCatalog,
  };
}
