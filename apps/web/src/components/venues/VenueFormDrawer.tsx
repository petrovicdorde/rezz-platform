import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
  const [isDirty, setIsDirty] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const requestClose = (): void => {
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  const confirmDiscard = (): void => {
    setShowDiscardConfirm(false);
    setIsDirty(false);
    onClose();
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && requestClose()}>
        <SheetContent
          side="right"
          className="w-full max-w-full gap-2 px-4 pt-3 pb-2"
        >
          <SheetHeader className="p-0 pb-2">
            <SheetTitle>{t('venue.add_new')}</SheetTitle>
          </SheetHeader>
          <div className="h-full overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <VenueForm
              onSuccess={onClose}
              onCancel={requestClose}
              onDirtyChange={setIsDirty}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Dialog
        open={showDiscardConfirm}
        onOpenChange={(open) => !open && setShowDiscardConfirm(false)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('venue.discard_confirm_title')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-tertiary-600">
            {t('venue.discard_confirm_body')}
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowDiscardConfirm(false)}
            >
              {t('venue.discard_no')}
            </Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={confirmDiscard}
            >
              {t('venue.discard_yes')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
