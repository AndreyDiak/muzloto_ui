import { http } from '../http';

interface ProcessEventCodeParams {
  code: string;
  telegramId: number;
  onSuccess?: (data: { event: { title: string }; newBalance: number }) => void;
  onError?: (error: string) => void;
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
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || `HTTP ${response.status}` };
      }
      
      const errorMessage = errorData.error || `Request failed with status ${response.status}`;
      onError?.(errorMessage);
      return;
    }

    const responseData = await response.json();

    if (responseData?.error) {
      onError?.(responseData.error);
      return;
    }

    if (!responseData?.success) {
      throw new Error(responseData?.error || 'Неизвестная ошибка при обработке кода');
    }

    onSuccess?.({
      event: responseData.event || { title: 'событие' },
      newBalance: responseData.newBalance,
    });
  } catch (err: any) {
    const errorMessage = err?.message || err?.error?.message || 'Произошла ошибка при обработке кода';
    onError?.(errorMessage);
    throw err;
  }
}
