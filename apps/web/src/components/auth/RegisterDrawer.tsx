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
    <Drawer
      open={isOpen}
      onOpenChange={(open) => !open && close()}
      direction="right"
    >
      <DrawerContent className="bg-[rgba(253,249,244,0.98)]">
        <div className="relative p-6">
          <DrawerClose asChild>
            <button className="absolute top-4 right-4 rounded-md p-1 text-[rgba(20,11,0,0.45)] transition-colors hover:bg-[rgba(20,11,0,0.05)] hover:text-[#140B00]">
              <X size={20} />
            </button>
          </DrawerClose>

          <DrawerHeader className="mb-6 p-0">
            <DrawerTitle className="font-serif text-2xl font-bold tracking-[-0.4px] text-[#140B00]">
              {view === 'form'
                ? t('auth.register_title')
                : t('auth.check_email_title')}
            </DrawerTitle>
            {view === 'form' && (
              <DrawerDescription className="text-sm text-[rgba(20,11,0,0.55)]">
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
