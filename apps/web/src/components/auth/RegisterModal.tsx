import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useRegisterStore } from '@/store/register-ui.store';
import { useLoginStore } from '@/store/login-ui.store';
import { RegisterForm } from './RegisterForm';
import { CheckEmailView } from './CheckEmailView';

export function RegisterModal(): React.JSX.Element {
  const { t } = useTranslation();
  const { isOpen, close, view, email, showCheckEmail } = useRegisterStore();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="w-full max-w-md rounded-xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">
            {view === 'form' ? t('auth.register_title') : t('auth.check_email_title')}
          </DialogTitle>
          {view === 'form' && (
            <DialogDescription className="text-sm text-tertiary-600">
              {t('auth.register_subtitle')}
            </DialogDescription>
          )}
        </DialogHeader>

        {view === 'check-email' ? (
          <CheckEmailView email={email} />
        ) : (
          <RegisterForm
            onSuccess={(email) => showCheckEmail(email)}
            onLogin={() => {
              close();
              useLoginStore.getState().open();
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
