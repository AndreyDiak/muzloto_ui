import type { NewlyUnlockedAchievement } from '@/entities/achievement';
import { http } from '../http';
import { type ApiProcessEventCodeResponse, type ApiError, parseJson } from '@/types/api';

interface ProcessEventCodeParams {
  code: string;
  telegramId: number;
  onSuccess?: (data: {
    event: { title: string };
    newBalance: number;
    coinsEarned: number;
    newlyUnlockedAchievements?: NewlyUnlockedAchievement[];
  }) => void;
  onError?: (error: string, statusCode?: number) => void;
}

export async function processEventCode({
  code,
  telegramId: _telegramId,
  onSuccess,
  onError,
}: ProcessEventCodeParams): Promise<void> {
  const CODE_LENGTH = 5;

  if (!code || code.length !== CODE_LENGTH) {
    onError?.('Неверный формат кода. Код должен состоять из 5 символов.');
    return;
  }

  try {
    const normalizedCode = code.toUpperCase();

    let { data: { session } } = await http.auth.getSession();
    
    if (!session) {
      const { data: { session: refreshedSession }, error: refreshError } = await http.auth.refreshSession();
      if (refreshError || !refreshedSession) {
        throw new Error('No active session. Please refresh the page.');
      }
      session = refreshedSession;
    }

    if (!session?.access_token) {
      throw new Error('No access token in session. Please refresh the page.');
    }

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

    const response = await fetch(`${backendUrl}/api/events/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        code: normalizedCode,
      }),
    });

    if (!response.ok) {
      const errorData = await parseJson<ApiError>(response).catch(() => ({ error: `HTTP ${response.status}` }));
      onError?.(errorData.error || `Request failed with status ${response.status}`, response.status);
      return;
    }

    const responseData = await parseJson<ApiProcessEventCodeResponse | ApiError>(response);

    if ('error' in responseData) {
      onError?.(responseData.error, 400);
      return;
    }

    if (!responseData.success) {
      throw new Error('Неизвестная ошибка при обработке кода');
    }

    onSuccess?.({
      event: responseData.event || { title: 'событие' },
      newBalance: responseData.newBalance,
      coinsEarned: responseData.coinsEarned,
      newlyUnlockedAchievements: responseData.newlyUnlockedAchievements,
    });
  } catch (err: unknown) {
    if (err instanceof TypeError && err.message === 'Failed to fetch') {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      const errorMessage = `Не удалось подключиться к серверу. Проверьте, что backend доступен по адресу: ${backendUrl}`;
      onError?.(errorMessage, 0);
      return;
    }
    
    const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при обработке кода';
    onError?.(errorMessage, 500);
  }
}
