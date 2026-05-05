import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useForgotPassword } from '@/hooks/useAuth';

interface ForgotPasswordFormValues {
  email: string;
}

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
  onDone: () => void;
}

const FIELD_INPUT =
  'h-11 rounded-xl border-[rgba(20,11,0,0.07)] bg-[#F5F1EB] px-4 text-[#140B00] shadow-none transition-all placeholder:text-[rgba(20,11,0,0.42)] hover:bg-white hover:border-[rgba(249,133,19,0.35)] focus-visible:border-[rgba(249,133,19,0.55)] focus-visible:bg-white focus-visible:shadow-[0_2px_12px_rgba(249,133,19,0.12)]';

export function ForgotPasswordForm({
  onBackToLogin,
  onDone,
}: ForgotPasswordFormProps): React.JSX.Element {
  const { t } = useTranslation();
  const forgotMutation = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>();

  return (
    <form
      onSubmit={handleSubmit((data) =>
        forgotMutation.mutate(data.email, { onSuccess: () => onDone() }),
      )}
      className="flex flex-col gap-4"
    >
      <div>
        <label
          htmlFor="forgot-email"
          className="mb-1.5 block text-sm font-medium text-[#140B00]"
        >
          {t('auth.email_label')}
        </label>
        <Input
          id="forgot-email"
          type="email"
          placeholder={t('auth.email_placeholder')}
          className={FIELD_INPUT}
          {...register('email', {
            required: t('auth.email_required'),
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: t('auth.email_invalid'),
            },
          })}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={forgotMutation.isPending}
        className="group relative mt-2 w-full overflow-hidden rounded-xl bg-linear-to-br from-secondary-400 to-secondary-500 px-4 py-3.5 text-base font-bold tracking-[0.3px] text-white shadow-[0_4px_12px_rgba(249,133,19,0.3),0_8px_28px_rgba(249,133,19,0.2)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(249,133,19,0.4),0_16px_40px_rgba(249,133,19,0.2)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-550 group-hover:translate-x-full"
        />
        <span className="relative">
          {forgotMutation.isPending
            ? t('common.loading')
            : t('auth.forgot_password_button')}
        </span>
      </button>

      <button
        type="button"
        onClick={onBackToLogin}
        className="mt-1 inline-flex cursor-pointer items-center justify-center gap-1.5 text-sm font-medium text-secondary-400 transition-colors hover:text-secondary-500"
      >
        <ArrowLeft className="size-3.5" />
        {t('auth.forgot_password_back_to_login')}
      </button>
    </form>
  );
}
