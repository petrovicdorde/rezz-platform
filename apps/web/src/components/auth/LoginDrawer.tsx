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
import { LoginForm } from './LoginForm';

export function LoginDrawer(): React.JSX.Element {
  const { t } = useTranslation();
  const { isOpen, close } = useLoginStore();

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
              {t('auth.login_title')}
            </DrawerTitle>
            <DrawerDescription className="text-sm text-tertiary-600">
              {t('auth.login_subtitle')}
            </DrawerDescription>
          </DrawerHeader>

          <LoginForm
            onForgotPassword={() => console.log('forgot')}
            onRegister={() => console.log('register')}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
