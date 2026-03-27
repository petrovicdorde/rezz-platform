import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { VenueForm } from './VenueForm';

interface VenueFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VenueFormModal({
  isOpen,
  onClose,
}: VenueFormModalProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-2xl p-6">
        <DialogHeader>
          <DialogTitle>{t('venue.add_new')}</DialogTitle>
        </DialogHeader>
        <div className="venue-modal-scroll max-h-[80vh] overflow-y-auto overflow-x-hidden pr-4">
          <VenueForm onSuccess={onClose} onCancel={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
