import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { EmployeeDetailContent } from './EmployeeDetailContent';
import type { Employee } from '@/lib/types/employee.types';

interface EmployeeDetailModalProps {
  employee: Employee | null;
  onClose: () => void;
}

export function EmployeeDetailModal({
  employee,
  onClose,
}: EmployeeDetailModalProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <Dialog open={employee !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-md p-0" showCloseButton={false}>
        <DialogTitle className="sr-only">{t('employees.details_title')}</DialogTitle>
        <div className="max-h-[80vh] overflow-y-auto p-6">
          {employee && (
            <EmployeeDetailContent employee={employee} onClose={onClose} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
