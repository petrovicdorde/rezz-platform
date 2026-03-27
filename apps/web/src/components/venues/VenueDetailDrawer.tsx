import { useTranslation } from 'react-i18next';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { VenueDetailContent } from './VenueDetailContent';
import type { AdminVenue } from '@/lib/types/venue.types';

interface VenueDetailDrawerProps {
  venue: AdminVenue | null;
  onClose: () => void;
}

export function VenueDetailDrawer({
  venue,
  onClose,
}: VenueDetailDrawerProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <Sheet open={venue !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="flex h-full w-full max-w-sm flex-col p-0" showCloseButton={false}>
        <SheetTitle className="sr-only">{t('venue.view_details')}</SheetTitle>
        <div className="flex-1 overflow-y-auto p-4">
          {venue && <VenueDetailContent venue={venue} onClose={onClose} />}
        </div>
      </SheetContent>
    </Sheet>
  );
}
