import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateSetting, useAdminSettings } from '@/hooks/useSettings';
import type { SettingType } from '@/lib/types/settings.types';

interface AddSettingFormProps {
  type: SettingType;
  onSuccess: () => void;
  onCancel: () => void;
}

interface AddFormValues {
  label: string;
}

export function AddSettingForm({
  type,
  onSuccess,
  onCancel,
}: AddSettingFormProps): React.JSX.Element {
  const { t } = useTranslation();
  const createSetting = useCreateSetting();
  const { data: existing } = useAdminSettings(type);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddFormValues>({
    defaultValues: { label: '' },
  });

  function onSubmit(data: AddFormValues): void {
    createSetting.mutate(
      {
        type,
        value: data.label,
        label: data.label,
        order: 0,
      },
      { onSuccess },
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mb-3 rounded-lg border border-primary-200 bg-tertiary-50 p-4"
    >
      <label className="mb-1 block text-xs font-medium text-tertiary-600">
        {t('settings.label_label')}
      </label>
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <Input
            placeholder={t(`settings.label_placeholder_${type}`)}
            {...register('label', {
              required: t('settings.label_required'),
              minLength: { value: 2, message: t('settings.label_required') },
              validate: (value) => {
                const normalized = value.trim().toLowerCase();
                const exists = existing?.some(
                  (s) => s.label.trim().toLowerCase() === normalized,
                );
                return exists ? t(`settings.already_exists_${type}`) : true;
              },
            })}
          />
          {errors.label && (
            <p className="mt-1 text-xs text-red-500">{errors.label.message}</p>
          )}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          {t('settings.cancel_add')}
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={createSetting.isPending}
          className="bg-primary-400 text-white hover:bg-primary-600"
        >
          {createSetting.isPending ? t('common.loading') : t('settings.save')}
        </Button>
      </div>
    </form>
  );
}
