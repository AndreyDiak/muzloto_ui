
export function getTgWebApp() {
  let webApp = window.Telegram?.WebApp;
  if(webApp?.initData === "") {
    // mock data for cases when we open our app in a browser
    webApp = {
      ...webApp,
      ...mockData
    }
  }
	return webApp
}

const mockData = {
  "initData": "query_id=AAEBuRIbAAAAAAG5EhtqoR-w&user=%7B%22id%22%3A454211841%2C%22first_name%22%3A%22Andrey%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22RaYYmiX%22%2C%22language_code%22%3A%22ru%22%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2F-rp5jCcTuOUAz1Ny2oTTIdbWrKnCfuEFmre9Ouk9ABU.svg%22%7D&auth_date=1769337992&signature=2-wadUDNjc3ngavMhYZTWXMgGVYEJoTNEAR2r5xctHwMsEyH6I01sGlmF8_AOD35a98JsCMj9GSwptxwp7aBAQ&hash=4755b2b084cf75acfb7764b8f6a291046e095158da22909cf0e43d6830d9eda6",
  "initDataUnsafe": {
    "query_id": "AAEBuRIbAAAAAAG5EhtqoR-w",
    "user": {
      "id": 454211841,
      "first_name": "Andrey",
      "last_name": "",
      "username": "RaYYmiX",
      "language_code": "ru",
      "allows_write_to_pm": true,
      "photo_url": "https://t.me/i/userpic/320/-rp5jCcTuOUAz1Ny2oTTIdbWrKnCfuEFmre9Ouk9ABU.svg"
    },
    "auth_date": 1769337992,
    "signature": "2-wadUDNjc3ngavMhYZTWXMgGVYEJoTNEAR2r5xctHwMsEyH6I01sGlmF8_AOD35a98JsCMj9GSwptxwp7aBAQ",
    "hash": "4755b2b084cf75acfb7764b8f6a291046e095158da22909cf0e43d6830d9eda6"
  },
  "version": "9.1",
  "platform": "tdesktop",
  "colorScheme": "dark",
  "themeParams": {
    "accent_text_color": "#6ab2f2",
    "bg_color": "#17212b",
    "bottom_bar_bg_color": "#17212b",
    "button_color": "#5288c1",
    "button_text_color": "#ffffff",
    "destructive_text_color": "#ec3942",
    "header_bg_color": "#17212b",
    "hint_color": "#708499",
    "link_color": "#6ab3f3",
    "secondary_bg_color": "#232e3c",
    "section_bg_color": "#17212b",
    "section_header_text_color": "#6ab3f3",
    "section_separator_color": "#111921",
    "subtitle_text_color": "#708499",
    "text_color": "#f5f5f5"
  },
  "isExpanded": true,
  "viewportHeight": 831,
  "viewportStableHeight": 831,
  "headerColor": "#17212b",
  "backgroundColor": "#17212b"
} as const