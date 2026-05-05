import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useLoginStore } from '@/store/login-ui.store';
import { useRegisterStore } from '@/store/register-ui.store';
import { LoginForm } from './LoginForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';

export function LoginModal(): React.JSX.Element {
  const { t } = useTranslation();
  const { isOpen, view, close, showLogin, showForgot } = useLoginStore();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="w-full max-w-md rounded-2xl border-[rgba(20,11,0,0.06)] bg-[rgba(253,249,244,0.98)] p-7 shadow-[0_0_0_1px_rgba(20,11,0,0.04),0_8px_16px_rgba(20,11,0,0.08),0_24px_48px_rgba(20,11,0,0.18),0_48px_72px_rgba(20,11,0,0.16)]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-bold tracking-[-0.4px] text-[#140B00]">
            {view === 'forgot'
              ? t('auth.forgot_password_title')
              : t('auth.login_title')}
          </DialogTitle>
          <DialogDescription className="text-sm text-[rgba(20,11,0,0.55)]">
            {view === 'forgot'
              ? t('auth.forgot_password_subtitle')
              : t('auth.login_subtitle')}
          </DialogDescription>
        </DialogHeader>

        {view === 'forgot' ? (
          <ForgotPasswordForm
            onBackToLogin={showLogin}
            onDone={() => {
              showLogin();
              close();
            }}
          />
        ) : (
          <LoginForm
            onForgotPassword={showForgot}
            onRegister={() => {
              close();
              useRegisterStore.getState().open();
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
