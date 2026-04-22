import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserMinus, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  useRemoveEmployee,
  useCancelInvitation,
  useUpdateEmployeeRole,
} from '@/hooks/useEmployees';
import { useAuthStore } from '@/store/auth.store';
import type { Employee } from '@/lib/types/employee.types';

interface EmployeeDetailContentProps {
  employee: Employee;
  onClose: () => void;
  venueId?: string;
}

function getInitials(employee: Employee): string {
  if (employee.firstName && employee.lastName) {
    return `${employee.firstName[0]}${employee.lastName[0]}`.toUpperCase();
  }
  return employee.email[0].toUpperCase();
}

export function EmployeeDetailContent({
  employee,
  onClose,
  venueId,
}: EmployeeDetailContentProps): React.JSX.Element {
  const { t } = useTranslation();
  const [confirmAction, setConfirmAction] = useState<
    'remove' | 'cancel_invite' | 'change_role' | null
  >(null);

  const removeEmployee = useRemoveEmployee(venueId);
  const cancelInvitation = useCancelInvitation(venueId);
  const updateRole = useUpdateEmployeeRole(venueId);
  const currentUserId = useAuthStore((s) => s.user?.id);
  const isSelf =
    employee.type === 'ACTIVE' && currentUserId === employee.id;

  const displayName =
    employee.firstName || employee.lastName
      ? `${employee.firstName ?? ''} ${employee.lastName ?? ''}`.trim()
      : employee.email;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-full text-lg font-medium ${
            employee.type === 'INVITED'
              ? 'border border-dashed border-tertiary-300 bg-tertiary-50 text-tertiary-400'
              : 'bg-secondary-100 text-secondary-600'
          }`}
        >
          {getInitials(employee)}
        </div>
        <div>
          <p className="font-medium text-secondary-600">{displayName}</p>
          <span
            className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
              employee.role === 'MANAGER'
                ? 'bg-secondary-100 text-secondary-700'
                : 'bg-tertiary-100 text-tertiary-600'
            }`}
          >
            {t(`employees.role_${employee.role.toLowerCase()}`)}
          </span>
        </div>
      </div>

      {/* Info rows */}
      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-tertiary-500">Email</span>
          <span className="text-secondary-600">{employee.email}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-tertiary-500">{t('reservation.phone_label')}</span>
          <span className="text-secondary-600">{employee.phone ?? '—'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-tertiary-500">{t('employees.invite_role_label')}</span>
          <span className="text-secondary-600">
            {t(`employees.role_${employee.role.toLowerCase()}`)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-tertiary-500">
            {format(new Date(employee.createdAt), 'dd.MM.yyyy')}
          </span>
        </div>
      </div>

      <Separator className="my-4" />

      {/* Actions */}
      {confirmAction === null && (
        <>
          {isSelf && (
            <p className="rounded-lg bg-tertiary-50 p-3 text-center text-sm text-tertiary-600">
              {t('employees.self_notice')}
            </p>
          )}

          {!isSelf && employee.type === 'ACTIVE' && (
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full border-secondary-300 text-secondary-600 hover:bg-secondary-50"
                onClick={() => setConfirmAction('change_role')}
              >
                {employee.role === 'WORKER'
                  ? t('employees.change_role_to_manager')
                  : t('employees.change_role_to_worker')}
              </Button>
              <Button
                variant="outline"
                className="w-full border-red-300 text-red-500 hover:bg-red-50"
                onClick={() => setConfirmAction('remove')}
              >
                <UserMinus className="mr-2 h-4 w-4" />
                {t('employees.remove')}
              </Button>
            </div>
          )}

          {employee.type === 'INVITED' && (
            <Button
              variant="outline"
              className="w-full border-red-300 text-red-500 hover:bg-red-50"
              onClick={() => setConfirmAction('cancel_invite')}
            >
              <XCircle className="mr-2 h-4 w-4" />
              {t('employees.cancel_invitation')}
            </Button>
          )}
        </>
      )}

      {confirmAction === 'remove' && (
        <div>
          <p className="mb-3 text-center text-sm text-secondary-600">
            {t('employees.remove_confirm', { name: displayName })}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => setConfirmAction(null)}>
              {t('common.cancel')}
            </Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={removeEmployee.isPending}
              onClick={() =>
                removeEmployee.mutate(employee.id, { onSuccess: onClose })
              }
            >
              {removeEmployee.isPending
                ? t('common.loading')
                : t('employees.remove_confirm_yes')}
            </Button>
          </div>
        </div>
      )}

      {confirmAction === 'cancel_invite' && (
        <div>
          <p className="mb-3 text-center text-sm text-secondary-600">
            {t('employees.cancel_invitation_confirm', {
              email: employee.email,
            })}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => setConfirmAction(null)}>
              {t('common.cancel')}
            </Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={cancelInvitation.isPending}
              onClick={() =>
                cancelInvitation.mutate(employee.id, { onSuccess: onClose })
              }
            >
              {cancelInvitation.isPending
                ? t('common.loading')
                : t('employees.remove_confirm_yes')}
            </Button>
          </div>
        </div>
      )}

      {confirmAction === 'change_role' && (
        <div>
          <p className="mb-3 text-center text-sm text-secondary-600">
            {t(
              employee.role === 'MANAGER'
                ? 'employees.change_role_to_worker_confirm'
                : 'employees.change_role_to_manager_confirm',
              { name: displayName },
            )}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => setConfirmAction(null)}>
              {t('common.cancel')}
            </Button>
            <Button
              className="bg-primary-400 text-white hover:bg-primary-600"
              disabled={updateRole.isPending}
              onClick={() => {
                const newRole =
                  employee.role === 'MANAGER' ? 'WORKER' : 'MANAGER';
                updateRole.mutate(
                  { id: employee.id, role: newRole },
                  { onSuccess: onClose },
                );
              }}
            >
              {updateRole.isPending
                ? t('common.loading')
                : t('employees.confirm_yes')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
