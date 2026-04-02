import { useState, useMemo } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Plus, UserX } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { EmployeeCard } from '@/components/employees/EmployeeCard';
import { EmployeeInviteDrawer } from '@/components/employees/EmployeeInviteDrawer';
import { EmployeeInviteModal } from '@/components/employees/EmployeeInviteModal';
import { EmployeeDetailDrawer } from '@/components/employees/EmployeeDetailDrawer';
import { EmployeeDetailModal } from '@/components/employees/EmployeeDetailModal';
import { useEmployees } from '@/hooks/useEmployees';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import type { Employee } from '@/lib/types/employee.types';

export const Route = createFileRoute('/dashboard/employees')({
  component: EmployeesPage,
});

function EmployeesPage(): React.JSX.Element {
  const { t } = useTranslation();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const isMobile = useMediaQuery('(max-width: 767px)');
  const { data: employees, isLoading } = useEmployees();

  const sortedEmployees = useMemo(() => {
    if (!employees) return [];
    const active = employees.filter((e) => e.type === 'ACTIVE');
    const invited = employees.filter((e) => e.type === 'INVITED');
    return [...active, ...invited];
  }, [employees]);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary-400">
          {t('employees.title')}
        </h1>
        <Button
          onClick={() => setIsInviteOpen(true)}
          className="hidden gap-2 bg-primary-400 text-white hover:bg-primary-600 md:inline-flex"
        >
          <Plus className="h-4 w-4" />
          {t('employees.add')}
        </Button>
      </div>

      {/* Content */}
      <div className="mt-4">
        {isLoading && (
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-xl bg-tertiary-200"
              />
            ))}
          </div>
        )}

        {!isLoading && sortedEmployees.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <UserX className="h-12 w-12 text-tertiary-300" />
            <p className="mt-2 text-tertiary-500">
              {t('employees.no_employees')}
            </p>
          </div>
        )}

        {!isLoading && sortedEmployees.length > 0 && (
          <div className="flex flex-col gap-3">
            {sortedEmployees.map((employee) => (
              <EmployeeCard
                key={employee.id}
                employee={employee}
                onClick={(e) => setSelectedEmployee(e)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Mobile FAB */}
      <button
        onClick={() => setIsInviteOpen(true)}
        className="fixed right-4 bottom-20 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary-400 shadow-lg md:hidden"
      >
        <Plus className="h-6 w-6 text-white" />
      </button>

      {/* Invite modal/drawer */}
      {isMobile ? (
        <EmployeeInviteDrawer
          isOpen={isInviteOpen}
          onClose={() => setIsInviteOpen(false)}
        />
      ) : (
        <EmployeeInviteModal
          isOpen={isInviteOpen}
          onClose={() => setIsInviteOpen(false)}
        />
      )}

      {/* Detail modal/drawer */}
      {isMobile ? (
        <EmployeeDetailDrawer
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
        />
      ) : (
        <EmployeeDetailModal
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
        />
      )}
    </DashboardLayout>
  );
}
