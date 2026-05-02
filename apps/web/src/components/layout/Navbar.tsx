import { useTranslation } from 'react-i18next';
import { LogOut } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useLoginStore } from '@/store/login-ui.store';
import { useAuthStore } from '@/store/auth.store';
import { useLogout } from '@/hooks/useAuth';

export function Navbar(): React.JSX.Element {
  const { t } = useTranslation();
  const { open } = useLoginStore();
  const { isAuthenticated, user } = useAuthStore();
  const logoutMutation = useLogout();

  return (
    <nav className="sticky top-0 z-50 flex h-[68px] items-center justify-between border-b border-[rgba(20,11,0,0.07)] bg-[rgba(245,241,235,0.85)] px-4 backdrop-blur-[24px] md:px-8">
      <Logo />

      {isAuthenticated && user ? (
        <div className="flex items-center">
          <button
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="rounded-md p-1.5 text-[rgba(20,11,0,0.45)] hover:bg-[rgba(20,11,0,0.05)] hover:text-[#140B00]"
            title={t('auth.logout_button')}
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={open}
          className="rounded-full bg-secondary-400 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(249,133,19,0.25),0_6px_20px_rgba(249,133,19,0.2)] transition-all hover:-translate-y-px hover:bg-secondary-600 hover:shadow-[0_4px_16px_rgba(249,133,19,0.4)]"
        >
          {t('auth.login_button')}
        </button>
      )}
    </nav>
  );
}
