import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VenueDetailContent } from './VenueDetailContent';
import type { AdminVenue } from '@/lib/types/venue.types';

interface VenueDetailModalProps {
  venue: AdminVenue | null;
  onClose: () => void;
}

export function VenueDetailModal({
  venue,
  onClose,
}: VenueDetailModalProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <Dialog open={venue !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-0" showCloseButton={false}>
        <DialogTitle className="sr-only">{t('venue.view_details')}</DialogTitle>
        <div className="max-h-[85vh] overflow-y-auto p-6">
          {venue && <VenueDetailContent venue={venue} onClose={onClose} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
