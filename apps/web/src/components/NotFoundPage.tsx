import { useTranslation } from 'react-i18next';
import { Link } from '@tanstack/react-router';
import { FileQuestion } from 'lucide-react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/button';

export function NotFoundPage(): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <PublicLayout>
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-20 text-center">
        <FileQuestion className="size-16 text-tertiary-300" />
        <p className="mt-6 text-5xl font-bold text-secondary-600">404</p>
        <p className="mt-4 text-xl font-medium text-secondary-600">
          {t('not_found.title')}
        </p>
        <p className="mt-2 max-w-md text-tertiary-500">
          {t('not_found.subtitle')}
        </p>
        <Link to="/" className="mt-8">
          <Button className="bg-primary-400 text-white hover:bg-primary-600">
            {t('not_found.back_home')}
          </Button>
        </Link>
      </div>
    </PublicLayout>
  );
}
