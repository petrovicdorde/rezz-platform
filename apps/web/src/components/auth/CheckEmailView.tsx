import { Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useRegisterStore } from '@/store/register-ui.store';

interface CheckEmailViewProps {
  email: string;
}

export function CheckEmailView({ email }: CheckEmailViewProps): React.JSX.Element {
  const { t } = useTranslation();
  const { close } = useRegisterStore();

  return (
    <div className="p-4 text-center">
      <Mail className="mx-auto mb-4 size-12 text-primary-400" />
      <h2 className="text-lg font-medium">{t('auth.check_email_title')}</h2>
      <p className="mt-1 text-sm text-tertiary-600">
        {t('auth.check_email_subtitle', { email })}
      </p>
      <p className="mt-3 text-xs text-tertiary-400">
        {t('auth.check_email_note')}
      </p>
      <Button variant="outline" className="mt-4 w-full" onClick={close}>
        {t('common.confirm')}
      </Button>
    </div>
  );
}
