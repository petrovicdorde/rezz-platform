import { useTranslation } from 'react-i18next';
import { Link } from '@tanstack/react-router';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLoginStore } from '@/store/login-ui.store';
import { useAuthStore } from '@/store/auth.store';
import { useLogout } from '@/hooks/useAuth';

export function Navbar(): React.JSX.Element {
  const { t } = useTranslation();
  const { open } = useLoginStore();
  const { isAuthenticated, user } = useAuthStore();
  const logoutMutation = useLogout();

  return (
    <nav className="sticky top-0 z-50 flex h-16 items-center justify-between bg-primary-400 px-4 md:px-8">
      <Link to="/">
        <img src="/rezz_logo_green.webp" alt={t('brand.name')} className="h-8 brightness-0 invert" />
      </Link>

      {isAuthenticated && user ? (
        <div className="flex items-center">
          <button
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="rounded-md p-1.5 text-white/60 hover:text-white"
            title={t('auth.logout_button')}
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <Button
          onClick={open}
          variant="outline"
          className="border-white text-white hover:bg-white hover:text-primary-400"
        >
          {t('auth.login_button')}
        </Button>
      )}
    </nav>
  );
}
