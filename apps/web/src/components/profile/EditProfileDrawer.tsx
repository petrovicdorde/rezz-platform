import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { useUpdateProfile } from '@/hooks/useProfile';

interface EditProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: {
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
  };
}

interface EditFormValues {
  firstName: string;
  lastName: string;
  phone: string;
}

export function EditProfileDrawer({
  isOpen,
  onClose,
  initialData,
}: EditProfileDrawerProps): React.JSX.Element {
  const { t } = useTranslation();
  const updateProfile = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<EditFormValues>({
    defaultValues: {
      firstName: initialData.firstName ?? '',
      lastName: initialData.lastName ?? '',
      phone: initialData.phone ?? '',
    },
  });

  useEffect(() => {
    reset({
      firstName: initialData.firstName ?? '',
      lastName: initialData.lastName ?? '',
      phone: initialData.phone ?? '',
    });
  }, [initialData.firstName, initialData.lastName, initialData.phone, reset]);

  function onSubmit(data: EditFormValues): void {
    updateProfile.mutate(
      {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        phone: data.phone.trim(),
      },
      {
        onSuccess: () => onClose(),
      },
    );
  }

  function handleCancel(): void {
    reset({
      firstName: initialData.firstName ?? '',
      lastName: initialData.lastName ?? '',
      phone: initialData.phone ?? '',
    });
    onClose();
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full max-w-sm p-0"
      >
        <div className="border-b border-tertiary-100 px-5 pt-5 pb-4">
          <SheetTitle className="text-base font-medium text-secondary-600">
            {t('profile.edit_profile')}
          </SheetTitle>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-1 flex-col"
        >
          <div className="space-y-4 px-5 pt-4">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase text-tertiary-500">
                {t('profile.first_name_label')}
              </label>
              <Input
                {...register('firstName', {
                  required: t('profile.first_name_label'),
                  minLength: {
                    value: 2,
                    message: t('profile.first_name_label'),
                  },
                })}
              />
              {errors.firstName && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium uppercase text-tertiary-500">
                {t('profile.last_name_label')}
              </label>
              <Input
                {...register('lastName', {
                  required: t('profile.last_name_label'),
                  minLength: {
                    value: 2,
                    message: t('profile.last_name_label'),
                  },
                })}
              />
              {errors.lastName && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.lastName.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium uppercase text-tertiary-500">
                {t('profile.phone_label')}
              </label>
              <Input
                type="tel"
                {...register('phone', {
                  required: t('profile.phone_label'),
                })}
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          <div className="mt-auto grid grid-cols-2 gap-3 border-t border-tertiary-100 px-5 py-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={updateProfile.isPending}
              className="cursor-pointer rounded-xl border border-tertiary-200 py-3 font-medium text-secondary-600 transition-colors hover:bg-tertiary-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={updateProfile.isPending || !isDirty}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary-400 py-3 font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updateProfile.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {t('profile.save_changes')}
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
