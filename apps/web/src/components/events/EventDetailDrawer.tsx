import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { EventDetailContent } from './EventDetailContent';
import type { VenueEvent } from '@/lib/types/event.types';

interface EventDetailDrawerProps {
  event: VenueEvent | null;
  onClose: () => void;
  onEdit: (event: VenueEvent) => void;
}

export function EventDetailDrawer({
  event,
  onClose,
  onEdit,
}: EventDetailDrawerProps): React.JSX.Element {
  return (
    <Sheet open={event !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full max-w-sm p-0">
        <SheetTitle className="sr-only">{event?.name ?? ''}</SheetTitle>
        <div className="flex-1 overflow-y-auto p-4">
          {event && (
            <EventDetailContent
              event={event}
              onClose={onClose}
              onEdit={onEdit}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
