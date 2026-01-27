// import { tgMockData } from "@/_mock/tg_data";


export function getTgWebApp() {
  let webApp = window.Telegram?.WebApp;
  if(webApp?.initData === "") {
    webApp = {
      ...webApp,
      // ...tgMockData
    }
  }
	return webApp
}

