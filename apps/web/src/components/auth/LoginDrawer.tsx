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
import { useLoginStore } from '@/store/login-ui.store';
import { useRegisterStore } from '@/store/register-ui.store';
import { LoginForm } from './LoginForm';

export function LoginDrawer(): React.JSX.Element {
  const { t } = useTranslation();
  const { isOpen, close } = useLoginStore();

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && close()} direction="right">
      <DrawerContent className="bg-[rgba(253,249,244,0.98)]">
        <div className="relative p-6">
          <DrawerClose asChild>
            <button
              className="absolute right-4 top-4 rounded-md p-1 text-[rgba(20,11,0,0.45)] transition-colors hover:bg-[rgba(20,11,0,0.05)] hover:text-[#140B00]"
            >
              <X size={20} />
            </button>
          </DrawerClose>

          <DrawerHeader className="mb-6 p-0">
            <DrawerTitle className="font-serif text-2xl font-bold tracking-[-0.4px] text-[#140B00]">
              {t('auth.login_title')}
            </DrawerTitle>
            <DrawerDescription className="text-sm text-[rgba(20,11,0,0.55)]">
              {t('auth.login_subtitle')}
            </DrawerDescription>
          </DrawerHeader>

          <LoginForm
            onForgotPassword={() => console.log('forgot')}
            onRegister={() => {
              close();
              useRegisterStore.getState().open();
            }}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
