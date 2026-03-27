import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { KeyRound } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSetPassword } from '@/hooks/useAuth';

interface SetPasswordSearch {
  token: string;
}

interface SetPasswordForm {
  password: string;
  confirmPassword: string;
}

export const Route = createFileRoute('/auth/set-password')({
  validateSearch: (search: Record<string, unknown>): SetPasswordSearch => ({
    token: (search.token as string) ?? '',
  }),
  component: SetPasswordPage,
});

function SetPasswordPage(): React.JSX.Element {
  const { t } = useTranslation();
  const { token } = Route.useSearch();
  const setPasswordMutation = useSetPassword();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SetPasswordForm>({
    defaultValues: { password: '', confirmPassword: '' },
  });

  function onSubmit(data: SetPasswordForm): void {
    setPasswordMutation.mutate({ token, password: data.password });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-tertiary-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center">
          <KeyRound className="mb-4 size-16 text-primary-400" />
          <h1 className="text-2xl font-bold text-secondary-600">
            {t('auth.set_password_title')}
          </h1>
          <p className="mt-2 text-center text-tertiary-600">
            {t('auth.set_password_subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              {t('auth.password_label')}
            </label>
            <Input
              type="password"
              {...register('password', {
                required: t('auth.password_required'),
                minLength: {
                  value: 8,
                  message: t('auth.password_min_length'),
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                  message: t('auth.password_weak'),
                },
              })}
              placeholder={t('auth.password_placeholder')}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              {t('auth.confirm_password_label')}
            </label>
            <Input
              type="password"
              {...register('confirmPassword', {
                required: t('auth.password_required'),
                validate: (val) =>
                  val === watch('password') || t('auth.passwords_not_match'),
              })}
              placeholder={t('auth.confirm_password_placeholder')}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={setPasswordMutation.isPending}
            className="w-full bg-primary-400 text-white hover:bg-primary-600"
          >
            {setPasswordMutation.isPending
              ? t('common.loading')
              : t('auth.set_password_button')}
          </Button>
        </form>
      </div>
    </div>
  );
}
