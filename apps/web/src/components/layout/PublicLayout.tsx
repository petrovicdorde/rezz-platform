import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from '@tanstack/react-router';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 flex h-16 items-center justify-between bg-secondary-600 px-4 md:px-8">
        <div className="flex-1" />
        <Link to="/">
          <img
            src="/rezz_logo_green.webp"
            alt={t('brand.name')}
            className="h-8 brightness-0 invert"
          />
        </Link>
        <div className="flex flex-1 items-center justify-end gap-2">
          {isAuthenticated && user ? (
            <>
              {user.role === 'GUEST' ? (
                <Link to="/profil" className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/50 bg-white/20 text-xs font-medium text-white">
                    {(
                      (user.firstName?.[0] ?? '') + (user.lastName?.[0] ?? '')
                    ).toUpperCase()}
                  </div>
                </Link>
              ) : (
                <Link
                  to={ROLE_REDIRECT[user.role] ?? '/'}
                  className="text-sm text-white/70 hover:text-white"
                >
                  {user.firstName}
                </Link>
              )}
              <button
                type="button"
                onClick={() => setLogoutOpen(true)}
                className="rounded-md p-1.5 text-white/60 hover:text-white"
                title={t('auth.logout_button')}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <Button
              onClick={open}
              variant="outline"
              size="sm"
              className="border-white/30 text-white hover:bg-white hover:text-secondary-600"
            >
              {t('nav.login')}
            </Button>
          )}
        </div>
      </nav>

      {/* Main */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-secondary-600 px-4 py-8 text-center text-sm text-tertiary-300 md:px-8">
        &copy; 2026 Rezz.ba. Sva prava zadržana.
      </footer>

      <LogoutConfirmDialog
        isOpen={logoutOpen}
        onClose={() => setLogoutOpen(false)}
      />
    </div>
  );
}
