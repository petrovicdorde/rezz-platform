import { useTranslation } from 'react-i18next';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { EmployeeDetailContent } from './EmployeeDetailContent';
import type { Employee } from '@/lib/types/employee.types';

interface EmployeeDetailDrawerProps {
  employee: Employee | null;
  onClose: () => void;
}

export function EmployeeDetailDrawer({
  employee,
  onClose,
}: EmployeeDetailDrawerProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <Sheet open={employee !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full max-w-sm p-0">
        <SheetTitle className="sr-only">{t('employees.details_title')}</SheetTitle>
        <div className="flex-1 overflow-y-auto p-4">
          {employee && (
            <EmployeeDetailContent employee={employee} onClose={onClose} />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
