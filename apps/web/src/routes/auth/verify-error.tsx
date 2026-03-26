import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/auth/verify-error')({
  component: VerifyErrorPage,
});

function VerifyErrorPage(): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-tertiary-50 px-4">
      <XCircle className="mb-4 size-16 text-red-500" />
      <h1 className="text-2xl font-bold text-secondary-600">
        {t('auth.verify_error_title')}
      </h1>
      <p className="mt-2 text-center text-tertiary-600">
        {t('auth.verify_error_subtitle')}
      </p>
      <Button
        variant="outline"
        className="mt-6"
        onClick={() => navigate({ to: '/' })}
      >
        {t('auth.verify_error_back')}
      </Button>
    </div>
  );
}
