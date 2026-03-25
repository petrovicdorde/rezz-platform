import { useTranslation } from 'react-i18next';
import { Link } from '@tanstack/react-router';
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
    <nav className="sticky top-0 z-50 flex h-16 items-center justify-between bg-secondary-600 px-4 md:px-8">
      <Link to="/" className="text-xl font-bold text-primary-400">
        {t('brand.name')}
      </Link>

      {isAuthenticated && user ? (
        <div className="flex items-center gap-3">
          <span className="text-sm text-tertiary-100">
            {t('nav.welcome', { name: user.firstName })}
          </span>
          <button
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="text-sm text-tertiary-300 hover:text-primary-400"
          >
            {t('auth.logout_button')}
          </button>
        </div>
      ) : (
        <Button
          onClick={open}
          variant="outline"
          className="border-primary-400 text-primary-400 hover:bg-primary-400 hover:text-primary-900"
        >
          {t('auth.login_button')}
        </Button>
      )}
    </nav>
  );
}
