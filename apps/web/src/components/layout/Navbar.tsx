import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { useLoginStore } from '@/store/login-ui.store';
import { useAuthStore } from '@/store/auth.store';

export function Navbar() {
  const { t } = useTranslation();
  const { open } = useLoginStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate({ to: '/' });
  };

  return (
    <nav className="sticky top-0 z-50 flex h-16 items-center justify-between bg-secondary-600 px-4 md:px-8">
      <Link to="/" className="text-xl font-bold text-primary-400">
        {t('brand.name')}
      </Link>

      {isAuthenticated && user ? (
        <div className="flex items-center gap-3">
          <span className="text-sm text-tertiary-100">
            {user.firstName} {user.lastName}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-tertiary-300 hover:text-primary-400"
          >
            {t('nav.logout')}
          </button>
        </div>
      ) : (
        <Button
          onClick={open}
          variant="outline"
          className="border-primary-400 text-primary-400 hover:bg-primary-400 hover:text-primary-900"
        >
          {t('auth.loginButton')}
        </Button>
      )}
    </nav>
  );
}
