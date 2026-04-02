import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateSetting } from '@/hooks/useSettings';
import type { SettingType } from '@/lib/types/settings.types';

interface AddSettingFormProps {
  type: SettingType;
  onSuccess: () => void;
  onCancel: () => void;
}

interface AddFormValues {
  label: string;
  value: string;
  order: number;
}

function toCodeValue(label: string): string {
  return label
    .toUpperCase()
    .replace(/\s+/g, '_')
    .replace(/[^A-Z0-9_]/g, '');
}

export function AddSettingForm({
  type,
  onSuccess,
  onCancel,
}: AddSettingFormProps): React.JSX.Element {
  const { t } = useTranslation();
  const createSetting = useCreateSetting();
  const [manualValue, setManualValue] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AddFormValues>({
    defaultValues: { label: '', value: '', order: 0 },
  });

  function onSubmit(data: AddFormValues): void {
    createSetting.mutate(
      {
        type,
        value: data.value,
        label: data.label,
        order: data.order || 0,
      },
      { onSuccess },
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mb-3 rounded-lg border border-primary-200 bg-tertiary-50 p-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-tertiary-600">
            {t('settings.label_label')}
          </label>
          <Input
            placeholder={t('settings.label_placeholder')}
            {...register('label', {
              required: t('settings.label_required'),
              minLength: { value: 2, message: t('settings.label_required') },
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                if (!manualValue) {
                  setValue('value', toCodeValue(e.target.value));
                }
              },
            })}
          />
          {errors.label && (
            <p className="mt-1 text-xs text-red-500">{errors.label.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-tertiary-600">
            {t('settings.value_label')}
          </label>
          <Input
            className="font-mono text-sm"
            placeholder={t('settings.value_placeholder')}
            {...register('value', {
              required: t('settings.value_required'),
              minLength: { value: 1, message: t('settings.value_required') },
              onChange: () => setManualValue(true),
            })}
          />
          {errors.value && (
            <p className="mt-1 text-xs text-red-500">{errors.value.message}</p>
          )}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-tertiary-600">
            {t('settings.order_label')}
          </label>
          <Input
            type="number"
            min={0}
            className="w-20"
            placeholder="0"
            {...register('order', { valueAsNumber: true })}
          />
        </div>
        <div className="ml-auto flex gap-2">
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
      </div>
    </form>
  );
}
