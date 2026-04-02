import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { EventDetailContent } from './EventDetailContent';
import type { VenueEvent } from '@/lib/types/event.types';

interface EventDetailModalProps {
  event: VenueEvent | null;
  onClose: () => void;
  onEdit: (event: VenueEvent) => void;
}

export function EventDetailModal({
  event,
  onClose,
  onEdit,
}: EventDetailModalProps): React.JSX.Element {
  return (
    <Dialog open={event !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-lg p-0" showCloseButton={false}>
        <DialogTitle className="sr-only">{event?.name ?? ''}</DialogTitle>
        <div className="max-h-[85vh] overflow-y-auto p-6">
          {event && (
            <EventDetailContent
              event={event}
              onClose={onClose}
              onEdit={onEdit}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
