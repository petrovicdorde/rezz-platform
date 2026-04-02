import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmployeeInviteForm } from './EmployeeInviteForm';

interface EmployeeInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EmployeeInviteModal({
  isOpen,
  onClose,
}: EmployeeInviteModalProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-md p-6">
        <DialogHeader>
          <DialogTitle>{t('employees.invite_title')}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[80vh] overflow-y-auto">
          <EmployeeInviteForm onSuccess={onClose} onCancel={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
