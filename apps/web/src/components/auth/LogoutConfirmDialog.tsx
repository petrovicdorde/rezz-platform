import { useTranslation } from 'react-i18next';
import { LogOut } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLogout } from '@/hooks/useAuth';

interface LogoutConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LogoutConfirmDialog({
  isOpen,
  onClose,
}: LogoutConfirmDialogProps): React.JSX.Element {
  const { t } = useTranslation();
  const logoutMutation = useLogout();

  function handleConfirm(): void {
    logoutMutation.mutate(undefined, {
      onSettled: () => onClose(),
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader className="items-center text-center">
          <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-red-50">
            <LogOut className="size-6 text-red-500" />
          </div>
          <DialogTitle>{t('auth.logout_confirm_title')}</DialogTitle>
          <DialogDescription className="text-center">
            {t('auth.logout_confirm_subtitle')}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            disabled={logoutMutation.isPending}
            onClick={handleConfirm}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {logoutMutation.isPending
              ? t('common.loading')
              : t('auth.logout_button')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
