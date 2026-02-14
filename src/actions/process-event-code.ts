import type { NewlyUnlockedAchievement } from '@/entities/achievement';
import { authFetch } from '@/lib/auth-fetch';
import {
  type ApiProcessEventCodeResponse,
  type ApiValidateCodeResponse,
  type ApiError,
  parseJson,
} from '@/types/api';

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

const CODE_LENGTH = 5;
const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001').replace(/\/$/, '');

/**
 * Валидирует код мероприятия: возвращает информацию о мероприятии, список команд и награду.
 * Не создаёт регистрацию — только проверяет.
 */
export async function validateEventCode(code: string): Promise<ApiValidateCodeResponse> {
  const normalized = (code ?? '').trim().replace(/\D/g, '');
  if (normalized.length !== CODE_LENGTH) {
    throw new Error('Неверный формат кода. Код должен состоять из 5 цифр.');
  }

  const response = await authFetch(`${BACKEND_URL}/api/events/validate-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: normalized }),
  });

  if (!response.ok) {
    const errorData = await parseJson<ApiError>(response).catch(() => ({ error: `HTTP ${response.status}` }));
    throw new Error(errorData.error || `Ошибка ${response.status}`);
  }

  return parseJson<ApiValidateCodeResponse>(response);
}

export async function processEventCode({
  code,
  telegramId: _telegramId,
  onSuccess,
  onError,
}: ProcessEventCodeParams): Promise<void> {
  const normalized = (code ?? '').trim().replace(/\D/g, '');
  if (normalized.length !== CODE_LENGTH) {
    onError?.('Неверный формат кода. Код должен состоять из 5 цифр.');
    return;
  }

  try {
    const response = await authFetch(`${BACKEND_URL}/api/events/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: normalized }),
    });

    if (!response.ok) {
      const errorData = await parseJson<ApiError>(response).catch(() => ({ error: `HTTP ${response.status}` }));
      onError?.(errorData.error || `Ошибка ${response.status}`, response.status);
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
      onError?.(`Не удалось подключиться к серверу.`, 0);
      return;
    }
    
    const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при обработке кода';
    onError?.(errorMessage, 500);
  }
}
