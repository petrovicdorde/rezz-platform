import { useTranslation } from 'react-i18next';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { EventForm } from './EventForm';
import type { VenueEvent } from '@/lib/types/event.types';

interface EventFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: VenueEvent;
}

export function EventFormDrawer({
  isOpen,
  onClose,
  initialData,
}: EventFormDrawerProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full max-w-sm gap-2 px-4 pt-3 pb-2">
        <SheetHeader className="p-0 pb-2">
          <SheetTitle>
            {initialData ? t('events.edit') : t('events.add')}
          </SheetTitle>
        </SheetHeader>
        <div className="h-full overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <EventForm
            initialData={initialData}
            onSuccess={onClose}
            onCancel={onClose}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
