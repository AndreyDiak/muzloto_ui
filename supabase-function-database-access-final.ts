// Финальная версия Edge Function с использованием СТАНДАРТНОЙ Supabase Auth
// НЕ требует SUPABASE_JWT_SECRET
// Использует стандартные токены Supabase с автоматическим refresh

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const te = new TextEncoder();

function toHex(buf: ArrayBuffer) {
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

async function hmac(keyBytes: Uint8Array, msg: string) {
  const key = await crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return crypto.subtle.sign("HMAC", key, te.encode(msg));
}

async function verifyInitData(initData: string, botToken: string, maxAgeSec = 3600) {
  const p = new URLSearchParams(initData);
  const hash = p.get("hash");
  const authDate = Number(p.get("auth_date") ?? "0");
  if (!hash || !authDate) return { ok: false as const, reason: "missing_fields" };

  const now = Math.floor(Date.now() / 1000);
  if (now - authDate > maxAgeSec) return { ok: false as const, reason: "expired" };

  const pairs: string[] = [];
  for (const [k, v] of p.entries()) if (k !== "hash") pairs.push(`${k}=${v}`);
  pairs.sort((a, b) => a.localeCompare(b));
  const dataCheckString = pairs.join("\n");

  const secretKeyBuf = await hmac(te.encode("WebAppData"), botToken);
  const expectedBuf = await hmac(new Uint8Array(secretKeyBuf), dataCheckString);
  if (toHex(expectedBuf) !== hash) return { ok: false as const, reason: "bad_hash" };

  const user = JSON.parse(p.get("user") ?? "null");
  return { ok: true as const, user };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method Not Allowed" }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 405 
      });
    }

    const requestBody = await req.json();
    const { initData } = requestBody;
    
    if (!initData || typeof initData !== 'string') {
      return new Response(JSON.stringify({ 
        error: "initData required",
        details: "initData must be a non-empty string"
      }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400 
      });
    }

    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!botToken || !supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ 
        error: "Missing environment variables"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Проверяем, является ли это mockData (для разработки)
    const isMockData = initData.includes("query_id=AAEBuRIbAAAAAAG5EhtqoR-w") || 
                       initData.includes("RaYYmiX");
    
    let tg;
    
    // Для mockData сразу извлекаем пользователя без верификации
    if (isMockData) {
      const p = new URLSearchParams(initData);
      const userStr = p.get("user");
      
      if (!userStr) {
        return new Response(JSON.stringify({ 
          error: "unauthorized", 
          details: "No user data found in mockData"
        }), { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401 
        });
      }
      
      try {
        const parsedUser = JSON.parse(decodeURIComponent(userStr));
        if (!parsedUser?.id) {
          return new Response(JSON.stringify({ 
            error: "unauthorized", 
            details: "MockData user has no ID"
          }), { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 401 
          });
        }
        tg = parsedUser;
      } catch (e) {
        return new Response(JSON.stringify({ 
          error: "unauthorized", 
          details: `Failed to parse mockData user: ${e.message}`
        }), { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401 
        });
      }
    } else {
      // Для реальных данных верифицируем Telegram initData
      const v = await verifyInitData(initData, botToken);
      
      if (!v.ok) {
        return new Response(JSON.stringify({ 
          error: "unauthorized", 
          reason: v.reason,
          details: `Failed to verify Telegram initData: ${v.reason}`
        }), { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401 
        });
      }
      
      tg = v.user;
    }
    
    if (!tg?.id) {
      return new Response(JSON.stringify({ 
        error: "no user",
        details: "User data not found in initData"
      }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401 
      });
    }

    // Создаем admin клиент
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Ищем существующего пользователя по telegram_id в user_metadata
    const { data: { users } } = await admin.auth.admin.listUsers();
    let existingUser = users?.find((u: any) => u.user_metadata?.telegram_id === tg.id);

    let userId: string;
    let userEmail: string;

    if (existingUser) {
      // Пользователь существует - обновляем метаданные
      userId = existingUser.id;
      userEmail = existingUser.email!;
      
      await admin.auth.admin.updateUserById(userId, {
        user_metadata: {
          telegram_id: tg.id,
          username: tg.username ?? null,
          first_name: tg.first_name ?? null,
        }
      });
    } else {
      // Создаем нового пользователя через стандартную Supabase Auth
      userEmail = `tg_${tg.id}@telegram.user`;
      
      const { data: newUser, error: createError } = await admin.auth.admin.createUser({
        email: userEmail,
        email_confirm: true, // Подтверждаем email автоматически
        user_metadata: {
          telegram_id: tg.id,
          username: tg.username ?? null,
          first_name: tg.first_name ?? null,
        },
      });

      if (createError || !newUser.user) {
        throw new Error(`Failed to create user: ${createError?.message}`);
      }

      userId = newUser.user.id;
    }

    // Создаем или обновляем профиль в таблице profiles
    // Проверяем, существует ли профиль
    const { data: existingProfile } = await admin
      .from("profiles")
      .select("telegram_id")
      .eq("telegram_id", tg.id)
      .single();

    if (existingProfile) {
      // Профиль существует - обновляем только username и first_name, баланс не трогаем
      await admin
        .from("profiles")
        .update({
          username: tg.username ?? null,
          first_name: tg.first_name ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq("telegram_id", tg.id);
    } else {
      // Профиль не существует - создаем новый с балансом 0
      await admin.from("profiles").insert({
        telegram_id: tg.id,
        username: tg.username ?? null,
        first_name: tg.first_name ?? null,
        balance: 0, // Начальный баланс для нового пользователя
      });
    }

    // Создаем сессию через generateLink + verifyOtp
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    if (!anonKey) {
      throw new Error("SUPABASE_ANON_KEY is required. Add it to Edge Function secrets.");
    }

    let linkData;
    try {
      const result = await admin.auth.admin.generateLink({
        type: 'magiclink',
        email: userEmail,
      });
      if (result.error || !result.data?.properties?.hashed_token) {
        throw new Error(`Failed to generate link: ${result.error?.message || 'No hashed_token'}`);
      }
      linkData = result.data;
    } catch (e) {
      throw new Error(`generateLink failed: ${e.message}`);
    }

    const anonClient = createClient(supabaseUrl, anonKey, {
      auth: { 
        autoRefreshToken: false, 
        persistSession: false 
      }
    });

    let verifyData;
    try {
      const result = await anonClient.auth.verifyOtp({
        token_hash: linkData.properties.hashed_token,
        type: 'email',
      });
      if (result.error || !result.data.session) {
        throw new Error(`Failed to verify OTP: ${result.error?.message || 'No session'}`);
      }
      verifyData = result.data;
    } catch (e) {
      throw new Error(`verifyOtp failed: ${e.message}`);
    }
    
    return new Response(JSON.stringify({ 
      access_token: verifyData.session.access_token,
      refresh_token: verifyData.session.refresh_token,
      expires_in: verifyData.session.expires_in || 3600,
      user: verifyData.user,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (err) {
    // Временно логируем ошибку для отладки
    console.error("Edge Function error:", err);
    console.error("Error stack:", err?.stack);
    
    return new Response(JSON.stringify({ 
      error: "Internal server error",
      message: err?.message ?? String(err),
      stack: err?.stack 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
