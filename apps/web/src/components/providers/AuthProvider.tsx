import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/lib/api/auth.api';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): React.JSX.Element {
  const { t } = useTranslation();
  const [isInitialized, setIsInitialized] = useState(false);
  const { accessToken, setUser, logout } = useAuthStore();

  useEffect(() => {
    const initialize = async () => {
      if (!accessToken) {
        setIsInitialized(true);
        return;
      }

      try {
        const user = await authApi.me();
        setUser(user);
      } catch {
        logout();
      } finally {
        setIsInitialized(true);
      }
    };

    initialize();
  }, []);

  if (!isInitialized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-tertiary-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-400 border-t-transparent" />
          <p className="text-sm text-tertiary-600">Učitavanje...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
