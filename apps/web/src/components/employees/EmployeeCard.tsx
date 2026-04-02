import { useTranslation } from 'react-i18next';
import type { Employee } from '@/lib/types/employee.types';

interface EmployeeCardProps {
  employee: Employee;
  onClick: (employee: Employee) => void;
}

function getInitials(employee: Employee): string {
  if (employee.firstName && employee.lastName) {
    return `${employee.firstName[0]}${employee.lastName[0]}`.toUpperCase();
  }
  return employee.email[0].toUpperCase();
}

function getStatusKey(employee: Employee): string {
  if (employee.type === 'ACTIVE') return 'employees.status_active';
  if (employee.invitationStatus === 'EXPIRED') return 'employees.status_expired';
  return 'employees.status_pending';
}

function getStatusStyle(employee: Employee): string {
  if (employee.type === 'ACTIVE') return 'bg-green-50 text-green-600';
  if (employee.invitationStatus === 'EXPIRED') return 'bg-red-50 text-red-500';
  return 'bg-amber-50 text-amber-600';
}

export function EmployeeCard({
  employee,
  onClick,
}: EmployeeCardProps): React.JSX.Element {
  const { t } = useTranslation();
  const displayName =
    employee.firstName || employee.lastName
      ? `${employee.firstName ?? ''} ${employee.lastName ?? ''}`.trim()
      : null;

  return (
    <div
      className="flex cursor-pointer items-center justify-between rounded-xl border border-tertiary-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
      onClick={() => onClick(employee)}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium ${
            employee.type === 'INVITED'
              ? 'border border-dashed border-tertiary-300 bg-tertiary-50 text-tertiary-400'
              : 'bg-secondary-100 text-secondary-600'
          }`}
        >
          {getInitials(employee)}
        </div>

        {/* Info */}
        <div>
          <p className="text-sm font-medium text-secondary-600">
            {displayName ?? employee.email}
          </p>
          {displayName && (
            <p className="text-xs text-tertiary-500">{employee.email}</p>
          )}
        </div>
      </div>

      {/* Right badges */}
      <div className="flex flex-col items-end gap-1">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            employee.role === 'MANAGER'
              ? 'bg-secondary-100 text-secondary-700'
              : 'bg-tertiary-100 text-tertiary-600'
          }`}
        >
          {t(`employees.role_${employee.role.toLowerCase()}`)}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs ${getStatusStyle(employee)}`}
        >
          {t(getStatusKey(employee))}
        </span>
      </div>
    </div>
  );
}
