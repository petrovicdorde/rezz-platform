import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
      <Dialog open={isOpen} onOpenChange={(open) => !open && requestClose()}>
        <DialogContent className="w-full max-w-2xl p-6">
          <DialogHeader>
            <DialogTitle>{t('venue.add_new')}</DialogTitle>
          </DialogHeader>
          <div className="venue-modal-scroll max-h-[80vh] overflow-y-auto overflow-x-hidden pr-4">
            <VenueForm
              onSuccess={onClose}
              onCancel={requestClose}
              onDirtyChange={setIsDirty}
            />
          </div>
        </DialogContent>
      </Dialog>

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
