import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmployeeCard } from '@/components/employees/EmployeeCard';
import { EmployeeDetailContent } from '@/components/employees/EmployeeDetailContent';
import { EmployeeInviteForm } from '@/components/employees/EmployeeInviteForm';
import { useEmployees } from '@/hooks/useEmployees';
import type { Employee } from '@/lib/types/employee.types';

interface EmployeesTabProps {
  venueId: string;
}

type View =
  | { kind: 'list' }
  | { kind: 'invite' }
  | { kind: 'detail'; employee: Employee };

export function EmployeesTab({ venueId }: EmployeesTabProps): React.JSX.Element {
  const { t } = useTranslation();
  const [view, setView] = useState<View>({ kind: 'list' });
  const { data: employees, isLoading } = useEmployees(venueId);

  const goList = (): void => setView({ kind: 'list' });

  if (view.kind === 'invite') {
    return (
      <div>
        <button
          type="button"
          onClick={goList}
          className="mb-3 flex items-center gap-1 text-sm text-tertiary-500 hover:text-tertiary-700"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </button>
        <EmployeeInviteForm
          venueId={venueId}
          onSuccess={goList}
          onCancel={goList}
        />
      </div>
    );
  }

  if (view.kind === 'detail') {
    return (
      <div>
        <button
          type="button"
          onClick={goList}
          className="mb-3 flex items-center gap-1 text-sm text-tertiary-500 hover:text-tertiary-700"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </button>
        <EmployeeDetailContent
          employee={view.employee}
          onClose={goList}
          venueId={venueId}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-tertiary-500">
          {employees?.length ?? 0} {t('employees.count_label')}
        </span>
        <Button
          size="sm"
          className="bg-primary-400 text-white hover:bg-primary-600"
          onClick={() => setView({ kind: 'invite' })}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          {t('employees.invite_button')}
        </Button>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-xl bg-tertiary-100"
            />
          ))}
        </div>
      )}

      {!isLoading && (!employees || employees.length === 0) && (
        <div className="py-10 text-center">
          <Users className="mx-auto h-10 w-10 text-tertiary-300" />
          <p className="mt-2 text-sm text-tertiary-400">
            {t('employees.empty')}
          </p>
        </div>
      )}

      {!isLoading && employees && employees.length > 0 && (
        <div className="flex flex-col gap-2">
          {employees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onClick={(e) => setView({ kind: 'detail', employee: e })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
