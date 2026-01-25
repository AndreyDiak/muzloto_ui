import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';
import { TelegramProvider } from './app/context/telegram';
import { SessionProvider } from './app/context/session';
import { ThemeProvider } from './app/context/theme';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TelegramProvider>
      <ThemeProvider>
        <SessionProvider>
          <App />
        </SessionProvider>
      </ThemeProvider>
    </TelegramProvider>
  </StrictMode>,
)
