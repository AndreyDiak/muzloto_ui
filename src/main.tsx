import { queryClient } from './lib/query-client';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { App } from './App.tsx';
import { CoinAnimationProvider } from './app/context/coin_animation.tsx';
import { SessionProvider } from './app/context/session';
import { TelegramProvider } from './app/context/telegram';
import { ThemeProvider } from './app/context/theme';
import { ToastProvider } from './app/context/toast';
import { Toaster } from './components/ui/sonner';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <TelegramProvider>
        <ThemeProvider>
          <SessionProvider>
            <ToastProvider>
              <CoinAnimationProvider>
                <App />
                <Toaster />
              </CoinAnimationProvider>
            </ToastProvider>
          </SessionProvider>
        </ThemeProvider>
      </TelegramProvider>
    </QueryClientProvider>
  </StrictMode>,
);
