import { authFetch } from "@/lib/auth-fetch";

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3001").replace(/\/$/, "");

/**
 * Определяет тип кода по таблице codes (registration | purchase).
 * Для «голых» 5 цифр без префикса — один запрос вместо угадывания.
 */
export async function fetchCodeType(
  code: string,
): Promise<"registration" | "purchase" | null> {
  const normalized = (code ?? "").trim().replace(/\D/g, "").slice(0, 5);
  if (normalized.length !== 5) return null;
  try {
    const res = await authFetch(
      `${BACKEND_URL}/api/codes/lookup?code=${encodeURIComponent(normalized)}`,
    );
    if (!res.ok) return null;
    const data = await res.json().catch(() => null);
    if (data?.type === "registration" || data?.type === "purchase") {
      return data.type;
    }
    return null;
  } catch {
    return null;
  }
}
