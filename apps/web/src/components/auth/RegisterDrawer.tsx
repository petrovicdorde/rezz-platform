import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from '@/components/ui/drawer';
import { useRegisterStore } from '@/store/register-ui.store';
import { useLoginStore } from '@/store/login-ui.store';
import { RegisterForm } from './RegisterForm';
import { CheckEmailView } from './CheckEmailView';

export function RegisterDrawer(): React.JSX.Element {
  const { t } = useTranslation();
  const { isOpen, close, view, email, showCheckEmail } = useRegisterStore();

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && close()} direction="right">
      <DrawerContent>
        <div className="relative p-6">
          <DrawerClose asChild>
            <button
              className="absolute right-4 top-4 text-tertiary-600 hover:text-tertiary-800"
            >
              <X size={20} />
            </button>
          </DrawerClose>

          <DrawerHeader className="mb-6 p-0">
            <DrawerTitle className="text-lg font-medium">
              {view === 'form' ? t('auth.register_title') : t('auth.check_email_title')}
            </DrawerTitle>
            {view === 'form' && (
              <DrawerDescription className="text-sm text-tertiary-600">
                {t('auth.register_subtitle')}
              </DrawerDescription>
            )}
          </DrawerHeader>

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
        </div>
      </DrawerContent>
    </Drawer>
  );
}
