import { useSession } from '@/app/context/session';
import { useToast } from '@/app/context/toast';
import { Button } from '@/components/ui/button';
import type { TransactionQRData } from '@/entities/transaction';
import { http } from '@/http';
import { RefreshCw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';

interface QRGeneratorProps {
  type: 'add' | 'subtract';
  amount: number;
}

export function QRGenerator({ type, amount }: QRGeneratorProps) {
  const { user } = useSession();
  const { showToast } = useToast();
  const [qrData, setQrData] = useState<TransactionQRData | string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const generateQR = async () => {
    if (!user?.id) {
      showToast('Пользователь не найден', 'error');
      return;
    }

    // Для начисления используем тестовый код события "00000"
    if (type === 'add') {
      setQrData('00000');
      setHasGenerated(true);
      return;
    }

    // Для снятия используем токен транзакции
    setIsLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

      // Получаем сессию для авторизации
      const { data: { session } } = await http.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Нет активной сессии');
      }

      const response = await fetch(`${backendUrl}/api/transactions/generate-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          amount,
          type,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Ошибка сервера' }));
        throw new Error(errorData.error || 'Ошибка генерации токена');
      }

      const data = await response.json();
      setQrData(data.qrData);
      setHasGenerated(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Автоматически генерируем QR код при монтировании
  useEffect(() => {
    if (!hasGenerated && user?.id) {
      generateQR();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasGenerated, user?.id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="w-48 h-48 bg-gray-800 rounded-lg flex items-center justify-center">
          <p className="text-gray-500 text-sm">Генерация...</p>
        </div>
      </div>
    );
  }

  const handleRegenerate = () => {
    setQrData(null);
    setHasGenerated(false);
    setIsLoading(false);
    generateQR();
  };

  if (!qrData) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="w-48 h-48 bg-gray-800 rounded-lg flex items-center justify-center">
          <p className="text-gray-500 text-sm">Ожидание...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="bg-white p-3 rounded-lg">
        <QRCodeSVG
          value={typeof qrData === 'string' ? qrData : JSON.stringify(qrData)}
          size={192}
          level="H"
          includeMargin={true}
        />
      </div>
      {typeof qrData !== 'string' && qrData && (
        <p className="text-xs text-gray-500 text-center">
          Действителен до: {new Date(qrData.expiresAt).toLocaleTimeString('ru-RU')}
        </p>
      )}
      {typeof qrData === 'string' && (
        <p className="text-xs text-gray-500 text-center">
          Тестовый код для начисления {amount} монет
        </p>
      )}
      {type === 'subtract' && (
        <Button
          onClick={handleRegenerate}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="mt-2 text-xs"
        >
          <RefreshCw className={`w-3 h-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          Перегенерировать
        </Button>
      )}
    </div>
  );
}
