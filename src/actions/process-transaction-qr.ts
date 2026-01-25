import { http } from '../http';
import type { TransactionQRData } from '../entities/transaction';

interface ProcessTransactionQRParams {
  qrData: TransactionQRData;
  onSuccess?: (data: {
    message: string;
    newBalance: number;
    oldBalance: number;
    amount: number;
    type: 'add' | 'subtract';
  }) => void;
  onError?: (message: string, statusCode?: number) => void;
}

export async function processTransactionQR({
  qrData,
  onSuccess,
  onError,
}: ProcessTransactionQRParams): Promise<void> {
  try {
    // Проверяем срок действия токена
    if (qrData.expiresAt < Date.now()) {
      onError?.('QR код истек. Пожалуйста, сгенерируйте новый.');
      return;
    }

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
    const normalizedUrl = backendUrl.replace(/\/$/, '');

    const response = await fetch(`${normalizedUrl}/api/transactions/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        token: qrData.token,
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
      onError?.(errorMessage, response.status);
      return;
    }

    const responseData = await response.json();

    if (responseData?.error) {
      onError?.(responseData.error, 400);
      return;
    }

    if (!responseData?.success) {
      throw new Error(responseData?.error || 'Неизвестная ошибка при обработке транзакции');
    }

    onSuccess?.({
      message: responseData.message,
      newBalance: responseData.newBalance,
      oldBalance: responseData.oldBalance,
      amount: responseData.amount,
      type: responseData.type,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
    onError?.(errorMessage);
  }
}
