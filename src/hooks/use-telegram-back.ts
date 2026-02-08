import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { getTgWebApp } from "@/lib/get_tg_init_webapp";

/**
 * Показывает кнопку «Назад» в Telegram, когда пользователь не на главной.
 * По нажатию — переход на предыдущую страницу приложения (navigate(-1)),
 * а не закрытие Mini App. В браузере без Telegram не делает ничего.
 */
export function useTelegramBack() {
  const location = useLocation();
  const navigate = useNavigate();
  const handlerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const backButton = getTgWebApp()?.BackButton;
    if (!backButton) return;

    const isRoot = location.pathname === "/" || location.pathname === "";

    if (isRoot) {
      backButton.hide();
      if (handlerRef.current) {
        backButton.offClick(handlerRef.current);
        handlerRef.current = null;
      }
      return;
    }

    const goBack = () => {
      navigate(-1);
    };
    handlerRef.current = goBack;
    backButton.onClick(goBack);
    backButton.show();

    return () => {
      backButton.hide();
      if (handlerRef.current) {
        backButton.offClick(handlerRef.current);
        handlerRef.current = null;
      }
    };
  }, [location.pathname, navigate]);
}
