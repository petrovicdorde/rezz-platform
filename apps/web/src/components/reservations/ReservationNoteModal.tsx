import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ReservationNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (note?: string) => void;
  title: string;
  confirmLabel: string;
  confirmClassName?: string;
  isPending?: boolean;
}

export function ReservationNoteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  confirmLabel,
  confirmClassName,
  isPending,
}: ReservationNoteModalProps): React.JSX.Element {
  const { t } = useTranslation();
  const [note, setNote] = useState('');

  function handleConfirm(): void {
    onConfirm(note || undefined);
    setNote('');
  }

  function handleClose(): void {
    setNote('');
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t('reservation.note_placeholder')}
          rows={3}
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            {t('common.cancel')}
          </Button>
          <Button
            className={confirmClassName}
            disabled={isPending}
            onClick={handleConfirm}
          >
            {isPending ? t('common.loading') : confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
