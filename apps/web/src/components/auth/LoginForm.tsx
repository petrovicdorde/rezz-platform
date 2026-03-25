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

export function LoginForm({ onForgotPassword, onRegister }: LoginFormProps) {
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
          {t('auth.emailLabel')}
        </label>
        <Input
          id="email"
          type="email"
          {...register('email', {
            required: t('auth.emailRequired'),
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: t('auth.emailInvalid'),
            },
          })}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">
          {t('auth.passwordLabel')}
        </label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            className="pr-10"
            {...register('password', {
              required: t('auth.passwordRequired'),
              minLength: {
                value: 8,
                message: t('auth.passwordMinLength'),
              },
            })}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
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
        {loginMutation.isPending ? t('common.loading') : t('auth.loginButton')}
      </Button>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm text-primary-400 hover:underline"
        >
          {t('auth.forgotPassword')}
        </button>
        <span className="text-sm text-tertiary-600">
          {t('auth.noAccount')}{' '}
          <button
            type="button"
            onClick={onRegister}
            className="text-primary-400 hover:underline"
          >
            {t('auth.registerLink')}
          </button>
        </span>
      </div>
    </form>
  );
}
