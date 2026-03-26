import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLoginStore } from '@/store/login-ui.store';

export const Route = createFileRoute('/auth/verified')({
  component: VerifiedPage,
});

function VerifiedPage(): React.JSX.Element {
  const { t } = useTranslation();
  const { open } = useLoginStore();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-tertiary-50 px-4">
      <CheckCircle className="mb-4 size-16 text-primary-400" />
      <h1 className="text-2xl font-bold text-secondary-600">
        {t('auth.verified_title')}
      </h1>
      <p className="mt-2 text-center text-tertiary-600">
        {t('auth.verified_subtitle')}
      </p>
      <Button
        className="mt-6 bg-primary-400 text-primary-900 hover:bg-primary-600"
        onClick={open}
      >
        {t('auth.verified_login_button')}
      </Button>
    </div>
  );
}
