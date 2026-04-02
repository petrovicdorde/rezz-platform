import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ReservationForm } from './ReservationForm';

interface ReservationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReservationFormModal({
  isOpen,
  onClose,
}: ReservationFormModalProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-lg p-6">
        <DialogHeader>
          <DialogTitle>{t('reservation.new')}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[85vh] overflow-y-auto">
          <ReservationForm onSuccess={onClose} onCancel={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
