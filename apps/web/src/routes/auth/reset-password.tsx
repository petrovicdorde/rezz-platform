/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, KeyRound } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useResetPassword } from '@/hooks/useAuth';

interface ResetPasswordSearch {
  token: string;
}

interface ResetPasswordForm {
  password: string;
  confirmPassword: string;
}

const FIELD_INPUT =
  'h-11 rounded-xl border-[rgba(20,11,0,0.07)] bg-[#F5F1EB] px-4 text-[#140B00] shadow-none transition-all placeholder:text-[rgba(20,11,0,0.42)] hover:bg-white hover:border-[rgba(249,133,19,0.35)] focus-visible:border-[rgba(249,133,19,0.55)] focus-visible:bg-white focus-visible:shadow-[0_2px_12px_rgba(249,133,19,0.12)]';

export const Route = createFileRoute('/auth/reset-password')({
  validateSearch: (search: Record<string, unknown>): ResetPasswordSearch => ({
    token: (search.token as string) ?? '',
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage(): React.JSX.Element {
  const { t } = useTranslation();
  const { token } = Route.useSearch();
  const resetMutation = useResetPassword();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    defaultValues: { password: '', confirmPassword: '' },
  });

  function onSubmit(data: ResetPasswordForm): void {
    resetMutation.mutate({ token, newPassword: data.password });
  }

  if (!token) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-tertiary-50 px-4">
        <div className="w-full max-w-sm text-center">
          <KeyRound className="mx-auto mb-4 size-16 text-secondary-400" />
          <h1 className="font-serif text-2xl font-bold tracking-[-0.4px] text-[#140B00]">
            {t('auth.reset_password_invalid_token')}
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-tertiary-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-[rgba(20,11,0,0.06)] bg-[rgba(253,249,244,0.98)] p-7 shadow-[0_0_0_1px_rgba(20,11,0,0.04),0_8px_16px_rgba(20,11,0,0.08),0_24px_48px_rgba(20,11,0,0.18),0_48px_72px_rgba(20,11,0,0.16)]">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-linear-to-br from-secondary-400 to-secondary-500 shadow-[0_4px_12px_rgba(249,133,19,0.3),0_8px_28px_rgba(249,133,19,0.2)]">
            <KeyRound className="size-7 text-white" />
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-[-0.4px] text-[#140B00]">
            {t('auth.reset_password_title')}
          </h1>
          <p className="mt-1 text-sm text-[rgba(20,11,0,0.55)]">
            {t('auth.reset_password_subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#140B00]">
              {t('auth.password_label')}
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder={t('auth.password_placeholder')}
                className={`${FIELD_INPUT} pr-11`}
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
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-[rgba(20,11,0,0.45)] transition-colors hover:text-[#140B00]"
                aria-label={
                  showPassword
                    ? t('auth.hide_password')
                    : t('auth.show_password')
                }
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#140B00]">
              {t('auth.confirm_password_label')}
            </label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder={t('auth.confirm_password_placeholder')}
                className={`${FIELD_INPUT} pr-11`}
                {...register('confirmPassword', {
                  required: t('auth.password_required'),
                  validate: (val) =>
                    val === watch('password') || t('auth.passwords_not_match'),
                })}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((p) => !p)}
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-[rgba(20,11,0,0.45)] transition-colors hover:text-[#140B00]"
                aria-label={
                  showConfirmPassword
                    ? t('auth.hide_password')
                    : t('auth.show_password')
                }
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={resetMutation.isPending}
            className="group relative mt-2 w-full overflow-hidden rounded-xl bg-linear-to-br from-secondary-400 to-secondary-500 px-4 py-3.5 text-base font-bold tracking-[0.3px] text-white shadow-[0_4px_12px_rgba(249,133,19,0.3),0_8px_28px_rgba(249,133,19,0.2)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(249,133,19,0.4),0_16px_40px_rgba(249,133,19,0.2)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-550 group-hover:translate-x-full"
            />
            <span className="relative">
              {resetMutation.isPending
                ? t('common.loading')
                : t('auth.reset_password_button')}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
