import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLogin } from '@/hooks/useAuth';

interface LoginFormValues {
  email: string;
  password: string;
}

interface LoginFormProps {
  onForgotPassword: () => void;
  onRegister: () => void;
}

export function LoginForm({ onForgotPassword, onRegister }: LoginFormProps): React.JSX.Element {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>();

  return (
    <form onSubmit={handleSubmit((data) => loginMutation.mutate(data))} className="flex flex-col gap-4">
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">
          {t('auth.email_label')}
        </label>
        <Input
          id="email"
          type="email"
          placeholder={t('auth.email_placeholder')}
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

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">
          {t('auth.password_label')}
        </label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder={t('auth.password_placeholder')}
            className="pr-10"
            {...register('password', {
              required: t('auth.password_required'),
              minLength: {
                value: 8,
                message: t('auth.password_min_length'),
              },
            })}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? t('auth.hide_password') : t('auth.show_password')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-tertiary-600 hover:text-tertiary-800"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={loginMutation.isPending}
        className={`w-full bg-primary-400 text-primary-900 hover:bg-primary-600 ${
          loginMutation.isPending ? 'opacity-70 cursor-not-allowed' : ''
        }`}
      >
        {loginMutation.isPending ? t('common.loading') : t('auth.login_button')}
      </Button>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm text-primary-400 hover:underline"
        >
          {t('auth.forgot_password')}
        </button>
        <span className="text-sm text-tertiary-600">
          {t('auth.no_account')}{' '}
          <button
            type="button"
            onClick={onRegister}
            className="text-primary-400 hover:underline"
          >
            {t('auth.register_link')}
          </button>
        </span>
      </div>
    </form>
  );
}
