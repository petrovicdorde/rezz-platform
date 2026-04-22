import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useInviteEmployee } from '@/hooks/useEmployees';
import i18n from '@/i18n';

interface EmployeeInviteFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  venueId?: string;
}

interface InviteFormValues {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: 'MANAGER' | 'WORKER';
}

export function EmployeeInviteForm({
  onSuccess,
  onCancel,
  venueId,
}: EmployeeInviteFormProps): React.JSX.Element {
  const { t } = useTranslation();
  const inviteEmployee = useInviteEmployee(venueId);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<InviteFormValues>({
    defaultValues: {
      email: '',
      phone: '',
      firstName: '',
      lastName: '',
      role: 'WORKER',
    },
  });

  function onSubmit(data: InviteFormValues): void {
    inviteEmployee.mutate(
      {
        email: data.email,
        phone: data.phone,
        firstName: data.firstName || undefined,
        lastName: data.lastName || undefined,
        role: data.role,
      },
      {
        onSuccess: () => {
          toast.success(i18n.t('employees.invite_success'));
          onSuccess();
        },
      },
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">
          {t('employees.invite_email_label')}
        </label>
        <Input
          {...register('email', {
            required: t('auth.email_required'),
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: t('auth.email_invalid'),
            },
          })}
          placeholder="email@example.com"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          {t('employees.invite_phone_label')}
        </label>
        <Input
          {...register('phone', {
            required: t('reservation.phone_required'),
          })}
          placeholder="+387..."
        />
        {errors.phone && (
          <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium">
            {t('employees.invite_first_name_label')}
          </label>
          <Input {...register('firstName')} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            {t('employees.invite_last_name_label')}
          </label>
          <Input {...register('lastName')} />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          {t('employees.invite_role_label')}
        </label>
        <Controller
          control={control}
          name="role"
          render={({ field }) => (
            <div className="flex gap-2">
              {(['MANAGER', 'WORKER'] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => field.onChange(role)}
                  className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    field.value === role
                      ? 'bg-primary-400 text-white'
                      : 'border border-tertiary-300 text-tertiary-600'
                  }`}
                >
                  {t(`employees.role_${role.toLowerCase()}`)}
                </button>
              ))}
            </div>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button
          type="submit"
          disabled={inviteEmployee.isPending}
          className="bg-primary-400 text-white hover:bg-primary-600"
        >
          {inviteEmployee.isPending
            ? t('common.loading')
            : t('employees.invite_button')}
        </Button>
      </div>
    </form>
  );
}
