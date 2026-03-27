import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSendInvitation } from '@/hooks/useVenues';
import i18n from '@/i18n';

interface ManagerFormProps {
  venueId: string;
  hasExistingManager: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

interface ManagerFormValues {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
}

export function ManagerForm({
  venueId,
  hasExistingManager,
  onSuccess,
  onCancel,
}: ManagerFormProps): React.JSX.Element {
  const { t } = useTranslation();
  const sendInvitation = useSendInvitation(venueId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ManagerFormValues>({
    defaultValues: {
      email: '',
      phone: '',
      firstName: '',
      lastName: '',
    },
  });

  function onSubmit(data: ManagerFormValues): void {
    sendInvitation.mutate(
      {
        email: data.email,
        phone: data.phone,
        firstName: data.firstName || undefined,
        lastName: data.lastName || undefined,
        role: 'MANAGER',
      },
      {
        onSuccess: () => {
          toast.success(i18n.t('venue.manager_invite_sent', { email: data.email }));
          onSuccess();
        },
      },
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {hasExistingManager && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          {t('venue.manager_replace_hint')}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium">
          {t('venue.manager_email_label')}
        </label>
        <Input
          {...register('email', {
            required: t('venue.manager_email_label'),
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: t('auth.email_invalid'),
            },
          })}
          placeholder={t('venue.manager_email_placeholder')}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          {t('venue.manager_phone_label')}
        </label>
        <Input
          {...register('phone', {
            required: t('venue.manager_phone_label'),
          })}
          placeholder={t('venue.manager_phone_placeholder')}
        />
        {errors.phone && (
          <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium">
            {t('venue.manager_first_name_label')}
          </label>
          <Input
            {...register('firstName')}
            placeholder={t('venue.manager_first_name_label')}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            {t('venue.manager_last_name_label')}
          </label>
          <Input
            {...register('lastName')}
            placeholder={t('venue.manager_last_name_label')}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button
          type="submit"
          disabled={sendInvitation.isPending}
          className="bg-primary-400 text-white hover:bg-primary-600"
        >
          {sendInvitation.isPending
            ? t('common.loading')
            : hasExistingManager
              ? t('venue.manager_replace')
              : t('venue.manager_add')}
        </Button>
      </div>
    </form>
  );
}
