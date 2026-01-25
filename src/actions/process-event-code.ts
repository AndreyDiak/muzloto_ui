import { http } from '../http';

interface ProcessEventCodeParams {
  code: string;
  telegramId: number;
  onSuccess?: (data: { event: { title: string }; newBalance: number }) => void;
  onError?: (error: string) => void;
}

/**
 * Обрабатывает код мероприятия: регистрирует пользователя и начисляет 10 монет
 * Вызывает Express backend API с JWT токеном для авторизации
 */
export async function processEventCode({
  code,
  telegramId,
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

    // Получаем сессию и токен
    let { data: { session } } = await http.auth.getSession();
    
    // Если сессии нет или она истекла, пытаемся обновить
    if (!session) {
      const { data: { session: refreshedSession }, error: refreshError } = await http.auth.refreshSession();
      if (refreshError || !refreshedSession) {
        throw new Error('No active session. Please refresh the page.');
      }
      session = refreshedSession;
    }

    // Проверяем, что токен валиден
    if (!session?.access_token) {
      throw new Error('No access token in session. Please refresh the page.');
    }

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

    console.log('Calling backend API:', { 
      code: normalizedCode, 
      telegram_id: telegramId,
      hasToken: !!session?.access_token,
      backendUrl,
    });

    // Вызываем Express backend API
    const response = await fetch(`${backendUrl}/api/events/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`, // JWT токен для авторизации
      },
      body: JSON.stringify({
        code: normalizedCode,
      }),
    });

    console.log('Backend API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend API error response:', errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || `HTTP ${response.status}` };
      }
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    const responseData = await response.json();
    console.log('Backend API response data:', responseData);

    if (responseData?.error) {
      onError?.(responseData.error);
      return;
    }

    if (!responseData?.success) {
      throw new Error(responseData?.error || 'Неизвестная ошибка при обработке кода');
    }

    // Успешная регистрация
    onSuccess?.({
      event: responseData.event || { title: 'событие' },
      newBalance: responseData.newBalance,
    });
  } catch (err: any) {
    console.error('Error processing event code:', err);
    const errorMessage = err?.message || err?.error?.message || 'Произошла ошибка при обработке кода';
    onError?.(errorMessage);
    throw err;
  }
}
