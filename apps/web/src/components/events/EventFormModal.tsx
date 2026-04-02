import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EventForm } from './EventForm';
import type { VenueEvent } from '@/lib/types/event.types';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: VenueEvent;
}

export function EventFormModal({
  isOpen,
  onClose,
  initialData,
}: EventFormModalProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-lg p-6">
        <DialogHeader>
          <DialogTitle>
            {initialData ? t('events.edit') : t('events.add')}
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[85vh] overflow-y-auto">
          <EventForm
            initialData={initialData}
            onSuccess={onClose}
            onCancel={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
