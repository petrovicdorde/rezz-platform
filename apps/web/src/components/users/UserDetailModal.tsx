import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { UserDetailContent } from './UserDetailContent';
import type { AdminUser } from '@/lib/types/user-admin.types';

interface UserDetailModalProps {
  user: AdminUser | null;
  onClose: () => void;
}

export function UserDetailModal({
  user,
  onClose,
}: UserDetailModalProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <Dialog open={user !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md overflow-y-auto" style={{ maxHeight: '85vh' }}>
        <DialogHeader>
          <DialogTitle>{t('users.details_title')}</DialogTitle>
        </DialogHeader>
        {user && <UserDetailContent user={user} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}
