import { useTranslation } from 'react-i18next';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { UserDetailContent } from './UserDetailContent';
import type { AdminUser } from '@/lib/types/user-admin.types';

interface UserDetailDrawerProps {
  user: AdminUser | null;
  onClose: () => void;
}

export function UserDetailDrawer({
  user,
  onClose,
}: UserDetailDrawerProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <Sheet open={user !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="h-full w-full max-w-sm overflow-y-auto p-4">
        <SheetHeader>
          <SheetTitle>{t('users.details_title')}</SheetTitle>
        </SheetHeader>
        {user && <UserDetailContent user={user} onClose={onClose} />}
      </SheetContent>
    </Sheet>
  );
}
