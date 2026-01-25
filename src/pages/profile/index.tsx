import { Award, Keyboard, QrCode, Target, TrendingUp, Trophy } from 'lucide-react';
import { useRef, useState } from 'react';
import { processEventCode } from '../../actions/process-event-code';
import { useSession } from '../../app/context/session';
import { useTelegram } from '../../app/context/telegram';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { http } from '../../http';
import { ProfileAchievements } from './_achievements';
import { ProfileStats } from './_stats';

const stats = [
  {
    icon: Trophy, label: 'Посещено событий', value: '14', textColor: 'var(--accent-gold)', bgColor: "var(--accent-gold-darker)", description: 'Вы посетили 14 событий'
  },
  { icon: Target, label: 'Активных билетов', value: '0', textColor: 'var(--accent-cyan)', bgColor: "var(--accent-cyan-darker)", description: 'У вас нет активных билетов' },
  { icon: TrendingUp, label: 'Уровень', value: '1', textColor: 'var(--accent-purple)', bgColor: "var(--accent-purple-darker)", description: 'Вы находитесь на 1 уровне' },
  { icon: Award, label: 'Достижения', value: '1', textColor: 'var(--accent-pink)', bgColor: "var(--accent-pink-darker)", description: 'У вас 1 достижение' },
];

const achievements = [
  { name: 'Первое событие', unlocked: true, description: 'Побывать на своей первой игре' },
  { name: 'Ценитель искусства', unlocked: false, description: 'Прослушать 100 песен' },
  { name: 'Коллекционер', unlocked: false, description: 'Собрать 100 карточек' },
  { name: 'VIP персона', unlocked: false, description: 'Получить VIP статус' },
];

export function Profile() {
  const { user, refetchProfile } = useSession();
  const { tg } = useTelegram();
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [codeInputs, setCodeInputs] = useState<string[]>(Array(5).fill(''));
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(5).fill(null));
  const CODE_LENGTH = 5;

  const handleScanQR = () => {
    if (!tg) {
      console.warn('Telegram WebApp not available');
      return;
    }

    tg.showScanQrPopup(
      {
        text: 'Наведите камеру на QR-код',
      },
      async (text) => {
        if (text) {
          // Обрабатываем отсканированный код
          await handleProcessEventCode(text);
        }
      }
    );
  };

  const handleEnterCode = () => {
    setIsCodeModalOpen(true);
  };

  const handleProcessEventCode = async (code: string) => {
    if (isProcessing) {
      return; // Предотвращаем множественные запросы
    }

    if (!user?.id) {
      tg?.showAlert('Ошибка: не удалось определить пользователя. Пожалуйста, перезагрузите страницу.');
      return;
    }

    setIsProcessing(true);

    try {
      await processEventCode({
        code,
        telegramId: user.id,
        onSuccess: async (data) => {
          const eventTitle = data.event.title;
          const newBalance = data.newBalance;

          tg?.showAlert(`Успешно! Вы зарегистрированы на мероприятие "${eventTitle}" и получили 10 монет! Новый баланс: ${newBalance}`);

          // Обновляем профиль для отображения нового баланса
          console.log('Refetching profile after successful registration...');
          try {
            await refetchProfile();
            console.log('Profile refetched successfully');

            // Проверяем, что баланс обновился
            const { data: { session: checkSession } } = await http.auth.getSession();
            if (checkSession) {
              const { data: updatedProfile } = await http
                .from('profiles')
                .select('balance')
                .eq('telegram_id', user.id)
                .single();
              console.log('Current balance after refetch:', updatedProfile?.balance);
            }
          } catch (refetchError) {
            console.error('Error refetching profile:', refetchError);
          }

          // Закрываем модалку и очищаем поля
          setCodeInputs(Array(5).fill(''));
          setIsCodeModalOpen(false);
        },
        onError: (error) => {
          tg?.showAlert(error);
        },
      });
    } catch (err: any) {
      console.error('Error processing event code:', err);
      const errorMessage = err?.message || err?.error?.message || 'Произошла ошибка при обработке кода';
      tg?.showAlert(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitCode = async () => {
    const code = codeInputs.join('');
    if (code.length !== CODE_LENGTH) {
      tg?.showAlert('Пожалуйста, введите полный код из 5 символов');
      return;
    }

    await handleProcessEventCode(code);
  };

  const handleInputChange = (index: number, value: string) => {
    // Берем последний символ и преобразуем в верхний регистр
    // Если введено несколько символов (например, при вставке), берем последний
    const char = value.length > 0 ? value.slice(-1).toUpperCase() : '';

    const newInputs = [...codeInputs];
    newInputs[index] = char;
    setCodeInputs(newInputs);

    // Если символ введен (даже если заменяет существующий), переходим к следующему input
    if (char && index < CODE_LENGTH - 1) {
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
      }, 0);
    }

    // Автоматически отправляем, если все поля заполнены
    if (char && index === CODE_LENGTH - 1) {
      const fullCode = newInputs.join('');
      if (fullCode.length === CODE_LENGTH) {
        setTimeout(() => {
          handleSubmitCode();
        }, 100);
      }
    }
  };

  const handleInputKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !codeInputs[index] && index > 0) {
      // Если поле пустое, переходим к предыдущему и очищаем его
      const newInputs = [...codeInputs];
      newInputs[index - 1] = '';
      setCodeInputs(newInputs);
      setTimeout(() => {
        inputRefs.current[index - 1]?.focus();
      }, 0);
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === 'Escape') {
      handleCloseModal();
    }
  };

  const handleCloseModal = () => {
    setCodeInputs(Array(5).fill(''));
    setIsCodeModalOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setCodeInputs(Array(5).fill(''));
    } else {
      // Фокусируем первый input при открытии модалки
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
    setIsCodeModalOpen(open);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Profile Header */}
      <div className="bg-[#16161d] rounded-2xl p-6 border border-[#00f0ff]/20 neon-glow">
        <div className="flex items-center gap-4">
          <Avatar size="lg" className='w-14! h-14!'>
            <AvatarImage src={user?.photo_url} />
            <AvatarFallback>{user?.first_name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl text-white mb-1">{user?.first_name} {user?.last_name}</h2>
            <p className="text-gray-400">@{user?.username}</p>
          </div>
        </div>
      </div>

      {/* QR Scanner Block with Manual Code Input */}
      <div className="bg-linear-to-r from-[#00f0ff]/20 to-[#b829ff]/20 rounded-2xl p-0 border border-[#00f0ff]/30 flex items-stretch overflow-hidden">
        <button
          onClick={handleScanQR}
          className="flex-1 flex items-center gap-3 p-4 hover:opacity-90 transition-opacity active:scale-[0.98] rounded-l-2xl"
        >
          <div className="shrink-0 w-12 h-12 rounded-xl bg-linear-to-br from-[#00f0ff] to-[#b829ff] flex items-center justify-center shadow-lg shadow-[#00f0ff]/30">
            <QrCode className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="text-base font-semibold text-white mb-0.5">Отсканировать QR</h3>
            <p className="text-xs text-gray-400">Открыть сканер</p>
          </div>
        </button>

        {/* Manual Code Input Button */}
        <button
          onClick={handleEnterCode}
          className="shrink-0 w-12 rounded-r-2xl bg-linear-to-br from-[#b829ff] to-[#00f0ff] flex items-center justify-center shadow-lg shadow-[#b829ff]/30 hover:scale-105 transition-transform active:scale-[0.95]"
          title="Ввести код вручную"
        >
          <Keyboard className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Stats Grid */}
      <ProfileStats stats={stats} />

      {/* Achievements */}
      <ProfileAchievements achievements={achievements} />

      {/* Code Input Dialog */}
      <Dialog open={isCodeModalOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="bg-[#16161d] border-[#00f0ff]/30 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white text-center">Введите код</DialogTitle>
          </DialogHeader>

          {/* Code blocks display */}
          <div className="flex gap-2 justify-center mb-6">
            {Array.from({ length: CODE_LENGTH }).map((_, index) => {
              const value = codeInputs[index] || '';
              const isFilled = value !== '';

              return (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="text"
                  value={value}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleInputKeyDown(index, e)}
                  onFocus={(e) => {
                    // Выделяем весь текст при фокусе, чтобы новый символ заменил старый
                    e.target.select();
                  }}
                  maxLength={1}
                  className={`
                    w-14 h-16 rounded-xl border-2 flex items-center justify-center
                    text-center text-2xl font-bold
                    transition-all duration-200
                    focus:outline-none
                    ${isFilled
                      ? 'bg-linear-to-br from-[#00f0ff] to-[#b829ff] border-[#00f0ff] text-white shadow-lg shadow-[#00f0ff]/30 scale-105'
                      : 'bg-[#0a0a0f] border-[#00f0ff]/30 text-gray-600 focus:border-[#00f0ff] focus:ring-2 focus:ring-[#00f0ff]/50'
                    }
                  `}
                />
              );
            })}
          </div>

          {/* Instructions */}
          <p className="text-center text-gray-400 text-sm mb-4">
            Введите код из {CODE_LENGTH} символов
          </p>

          {/* Action buttons */}
          <div className="flex">
            <button
              onClick={handleSubmitCode}
              disabled={codeInputs.join('').length !== CODE_LENGTH || isProcessing}
              className="flex-1 px-4 py-2.5 bg-linear-to-r from-[#00f0ff] to-[#b829ff] rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-[#00f0ff]/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Обработка...' : 'Подтвердить'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
