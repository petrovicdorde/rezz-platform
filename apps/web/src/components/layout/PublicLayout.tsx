import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from '@tanstack/react-router';
import { LogOut } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { LogoutConfirmDialog } from '@/components/auth/LogoutConfirmDialog';
import { useLoginStore } from '@/store/login-ui.store';
import { useAuthStore } from '@/store/auth.store';
import { ROLE_REDIRECT } from '@/hooks/useAuth';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({
  children,
}: PublicLayoutProps): React.JSX.Element {
  const { t } = useTranslation();
  const { open } = useLoginStore();
  const { isAuthenticated, user } = useAuthStore();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    function onScroll(): void {
      const y = window.scrollY;
      const delta = y - lastScrollY.current;

      if (y < 80) {
        setNavVisible(true);
      } else if (delta > 6) {
        setNavVisible(false);
      } else if (delta < -6) {
        setNavVisible(true);
      }
      lastScrollY.current = y;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <nav
        data-visible={navVisible}
        className="right-scroll-bar-position fixed top-0 right-0 left-0 z-50 flex h-[68px] items-center justify-between border-b border-[rgba(20,11,0,0.07)] bg-[rgba(245,241,235,0.85)] px-4 backdrop-blur-[24px] backdrop-saturate-150 transition-opacity duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] data-[visible=false]:pointer-events-none data-[visible=false]:opacity-0 md:px-[5%]"
        style={{ WebkitBackdropFilter: 'blur(24px) saturate(1.5)' }}
      >
        <Logo />

        <div className="flex items-center gap-2">
          {isAuthenticated && user ? (
            <>
              {user.role === 'GUEST' ? (
                <Link to="/profil" className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(20,11,0,0.1)] bg-[rgba(20,11,0,0.04)] text-xs font-semibold text-[#140B00]">
                    {(
                      (user.firstName?.[0] ?? '') + (user.lastName?.[0] ?? '')
                    ).toUpperCase()}
                  </div>
                </Link>
              ) : (
                <Link
                  to={ROLE_REDIRECT[user.role] ?? '/'}
                  className="text-sm font-medium text-[rgba(20,11,0,0.6)] hover:text-[#140B00]"
                >
                  {user.firstName}
                </Link>
              )}
              <button
                type="button"
                onClick={() => setLogoutOpen(true)}
                className="rounded-md p-1.5 text-[rgba(20,11,0,0.45)] transition-colors hover:bg-[rgba(20,11,0,0.05)] hover:text-[#140B00]"
                title={t('auth.logout_button')}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={open}
              className="rounded-full bg-secondary-400 px-6 py-2.5 text-sm font-semibold tracking-[0.1px] text-white shadow-[0_2px_8px_rgba(249,133,19,0.25),0_6px_20px_rgba(249,133,19,0.2)] transition-all hover:-translate-y-px hover:bg-secondary-500 hover:shadow-[0_4px_16px_rgba(249,133,19,0.4)]"
            >
              {t('nav.login')}
            </button>
          )}
        </div>
      </nav>

      {/* Main */}
      <main className="flex-1 pt-[68px]">{children}</main>

      {/* Footer — hidden for now.
      <footer className="bg-secondary-500 px-4 py-8 text-center text-sm text-tertiary-300 md:px-8">
        &copy; 2026 Table.ba. Sva prava zadržana.
      </footer>
      */}

      <LogoutConfirmDialog
        isOpen={logoutOpen}
        onClose={() => setLogoutOpen(false)}
      />
    </div>
  );
}
