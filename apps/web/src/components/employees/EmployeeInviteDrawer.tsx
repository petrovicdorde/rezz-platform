import { useTranslation } from 'react-i18next';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { EmployeeInviteForm } from './EmployeeInviteForm';

interface EmployeeInviteDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EmployeeInviteDrawer({
  isOpen,
  onClose,
}: EmployeeInviteDrawerProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full max-w-sm gap-2 px-4 pt-3 pb-2">
        <SheetHeader className="p-0 pb-2">
          <SheetTitle>{t('employees.invite_title')}</SheetTitle>
        </SheetHeader>
        <div className="h-full overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <EmployeeInviteForm onSuccess={onClose} onCancel={onClose} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
