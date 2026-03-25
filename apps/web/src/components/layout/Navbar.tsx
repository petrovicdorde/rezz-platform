import { useTranslation } from 'react-i18next';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { useLoginStore } from '@/store/login-ui.store';

export function Navbar() {
  const { t } = useTranslation();
  const { open } = useLoginStore();

  return (
    <nav className="sticky top-0 z-50 flex h-16 items-center justify-between bg-secondary-600 px-4 md:px-8">
      <Link to="/" className="text-xl font-bold text-primary-400">
        {t('brand.name')}
      </Link>

      <Button
        onClick={open}
        variant="outline"
        className="border-primary-400 text-primary-400 hover:bg-primary-400 hover:text-primary-900"
      >
        {t('auth.loginButton')}
      </Button>
    </nav>
  );
}
