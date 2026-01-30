import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import type { SProfile } from '../../entities/profile/types';
import type { TSession } from '../../entities/session/types';
import type { TUser } from '../../entities/user/types';
import { http } from '../../http';
import { getTelegramSession } from '../../lib/get_tg_session';
import { useTelegram } from './telegram';

interface SessionContextType {
  user?: TUser;
  profile?: SProfile;
  isRoot: boolean;
  initData: string;
  initDataUnsafe: TSession | undefined;
  parsedData: Record<string, string>;
  isLoading: boolean;
  isProfileLoading: boolean;
  isSupabaseSessionReady: boolean;
  refetchProfile: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const { tg } = useTelegram();
  const [user, setUser] = useState<TUser | undefined>(undefined);
  const [profile, setProfile] = useState<SProfile | undefined>(undefined);
  const [isRoot, setIsRoot] = useState(false);
  const [initData, setInitData] = useState<string>('');
  const [initDataUnsafe, setInitDataUnsafe] = useState<TSession | undefined>(undefined);
  const [parsedData, setParsedData] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isSupabaseSessionReady, setIsSupabaseSessionReady] = useState(false);

  const fetchProfile = useCallback(async (telegramId: number) => {
    setIsProfileLoading(true);
    try {
      const { data, error } = await http
        .from('profiles')
        .select('*')
        .eq('telegram_id', telegramId)
        .single();

      if (error) {
        setProfile(undefined);
      } else {
        setProfile(data);
      }
    } catch (error) {
      setProfile(undefined);
    } finally {
      setIsProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initData || isLoading || !user?.id) {
      return;
    }

    const initSupabaseSessionAndProfile = async () => {
      try {
        const { data: { session: existingSession } } = await http.auth.getSession();
        if (existingSession) {
          const { data: { user: supabaseUser }, error: userError } = await http.auth.getUser();

          if (supabaseUser && !userError) {
            setIsSupabaseSessionReady(true);
            await fetchProfile(user.id);
            const photoUrl = tg?.initDataUnsafe?.user?.photo_url;
            if (photoUrl) {
              await http.from('profiles').update({ avatar_url: photoUrl }).eq('telegram_id', user.id);
              await fetchProfile(user.id);
            }
            const { data: rootRow } = await http.from('root_user_tags').select('telegram_id').eq('telegram_id', user.id).maybeSingle();
            setIsRoot(!!rootRow);
            return;
          }
        }

        const session = await getTelegramSession();
        await http.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });
        setIsSupabaseSessionReady(true);
        await fetchProfile(user.id);
        const photoUrl = tg?.initDataUnsafe?.user?.photo_url;
        if (photoUrl) {
          await http.from('profiles').update({ avatar_url: photoUrl }).eq('telegram_id', user.id);
          await fetchProfile(user.id);
        }
        const { data: rootRow } = await http.from('root_user_tags').select('telegram_id').eq('telegram_id', user.id).maybeSingle();
        setIsRoot(!!rootRow);
      } catch (error) {
        setIsSupabaseSessionReady(false);
      }
    };

    initSupabaseSessionAndProfile();
  }, [initData, isLoading, user?.id, fetchProfile, tg]);

  useEffect(() => {
    const {
      data: { subscription },
    } = http.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
        setIsSupabaseSessionReady(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!tg) {
      setIsLoading(false);
      return;
    }

    const data = tg.initData;
    setInitData(data);

    const unsafeData = tg.initDataUnsafe;
    setInitDataUnsafe(unsafeData ?? undefined);

    if (unsafeData?.user) {
      setUser(unsafeData.user);
    }

    if (data) {
      const params = new URLSearchParams(data);
      const parsed: Record<string, string> = {};
      params.forEach((value, key) => {
        parsed[key] = value;
      });
      setParsedData(parsed);
    }

    setIsLoading(false);
  }, [tg]);

  const refetchProfile = useCallback(async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  }, [user?.id, fetchProfile]);

  const value: SessionContextType = {
    user,
    profile,
    isRoot,
    initData,
    initDataUnsafe,
    parsedData,
    isLoading,
    isProfileLoading,
    isSupabaseSessionReady,
    refetchProfile,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
