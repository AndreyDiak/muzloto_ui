import { http } from "@/http";
import { getTgWebApp } from "./get_tg_init_webapp";

export async function getTelegramSession() {
  const webApp = getTgWebApp();
  const initData = webApp?.initData;

  if (!initData) {
    throw new Error("No Telegram initData (open app inside Telegram)");
  }

  const initDataString = typeof initData === 'string' ? initData : String(initData);
  
  const { data, error } = await http.functions.invoke('database-access', {
    body: {
      initData: initDataString,
    },
  });

  if (error) {
    const errorMessage = error.message || 'Failed to get session';
    throw new Error(errorMessage);
  }

  if (!data?.access_token) {
    throw new Error('No access_token in response');
  }

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
    user: data.user,
  };
}