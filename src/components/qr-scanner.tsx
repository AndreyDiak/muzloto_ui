import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { processTransactionQR } from '@/actions/process-transaction-qr';
import { processEventCode } from '@/actions/process-event-code';
import { useSession } from '@/app/context/session';
import { useToast } from '@/app/context/toast';
import { useCoinAnimation } from '@/app/context/coin_animation';
import type { TransactionQRData } from '@/entities/transaction';

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan?: (data: string) => void;
}

export function QRScanner({ isOpen, onClose, onScan }: QRScannerProps) {
  const { user, refetchProfile } = useSession();
  const { showToast } = useToast();
  const { showCoinAnimation } = useCoinAnimation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleQRScan = async (scannedData: string) => {
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      // Пытаемся распарсить как JSON (транзакция)
      let parsedData: TransactionQRData | null = null;
      try {
        parsedData = JSON.parse(scannedData);
        // Проверяем, что это действительно TransactionQRData
        if (parsedData && typeof parsedData === 'object' && 'token' in parsedData && 'type' in parsedData) {
          // Это транзакция
          await processTransactionQR({
            qrData: parsedData,
            onSuccess: (data) => {
              showToast(data.message, 'success');
              if (data.type === 'add') {
                showCoinAnimation(data.amount);
              }
              refetchProfile();
              onClose();
              onScan?.(scannedData);
            },
            onError: (message, statusCode) => {
              showToast(message, 'error');
              if (statusCode !== 410 && statusCode !== 404) {
                // Не закрываем модалку для истекших/не найденных токенов
                onClose();
              }
            },
          });
          return;
        }
      } catch {
        // Не JSON, возможно это код события
      }

      // Если не транзакция, обрабатываем как код события
      if (!parsedData && scannedData.length === 5) {
        if (!user?.id) {
          showToast('Пользователь не найден', 'error');
          return;
        }
        
        await processEventCode({
          code: scannedData,
          telegramId: user.id,
          onSuccess: (data) => {
            showToast(`Вы зарегистрированы на ${data.event?.title || 'мероприятие'}`, 'success');
            showCoinAnimation(data.coinsEarned ?? 0);
            refetchProfile();
            onClose();
            onScan?.(scannedData);
          },
          onError: (message, statusCode) => {
            showToast(message, 'error');
            if (statusCode === 409 || statusCode === 200) {
              // Закрываем модалку для дубликатов
              onClose();
            }
            // Для других ошибок оставляем модалку открытой
          },
        });
        return;
      }

      showToast('Неверный формат QR кода', 'error');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      showToast(errorMessage, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#16161d] border-[#00f0ff]/30 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-white">Сканирование QR кода</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-gray-400 text-sm text-center">
            {isProcessing 
              ? 'Обработка...' 
              : 'Используйте камеру для сканирования QR кода'}
          </p>

          {/* Здесь можно добавить реальный сканер QR кодов */}
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-500 text-sm">
              В Telegram WebApp используйте нативный сканер
            </p>
            <p className="text-gray-600 text-xs mt-2">
              Для тестирования можно ввести код вручную
            </p>
          </div>

          {/* Для тестирования - можно ввести данные вручную */}
          <div className="text-xs text-gray-500 text-center">
            Для тестирования транзакций используйте QR код, сгенерированный через QRGenerator
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
