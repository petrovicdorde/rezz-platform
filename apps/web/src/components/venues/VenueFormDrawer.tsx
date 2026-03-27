import { useTranslation } from 'react-i18next';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { VenueForm } from './VenueForm';

interface VenueFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VenueFormDrawer({
  isOpen,
  onClose,
}: VenueFormDrawerProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full max-w-full gap-2 px-4 pt-3 pb-2">
        <SheetHeader className="p-0 pb-2">
          <SheetTitle>{t('venue.add_new')}</SheetTitle>
        </SheetHeader>
        <div className="h-full overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <VenueForm onSuccess={onClose} onCancel={onClose} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
