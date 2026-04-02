import { useTranslation } from 'react-i18next';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ReservationForm } from './ReservationForm';

interface ReservationFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReservationFormDrawer({
  isOpen,
  onClose,
}: ReservationFormDrawerProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full max-w-sm gap-2 px-4 pt-3 pb-2">
        <SheetHeader className="p-0 pb-2">
          <SheetTitle>{t('reservation.new')}</SheetTitle>
        </SheetHeader>
        <div className="h-full overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ReservationForm onSuccess={onClose} onCancel={onClose} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
