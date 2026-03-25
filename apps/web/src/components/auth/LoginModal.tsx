import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useLoginStore } from '@/store/login-ui.store';
import { LoginForm } from './LoginForm';

export function LoginModal() {
  const { t } = useTranslation();
  const { isOpen, close } = useLoginStore();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-w-md w-full rounded-xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">
            {t('auth.welcomeBack')}
          </DialogTitle>
          <DialogDescription className="text-sm text-tertiary-600">
            {t('auth.loginSubtitle')}
          </DialogDescription>
        </DialogHeader>

        <LoginForm
          onForgotPassword={() => console.log('forgot')}
          onRegister={() => console.log('register')}
        />
      </DialogContent>
    </Dialog>
  );
}
