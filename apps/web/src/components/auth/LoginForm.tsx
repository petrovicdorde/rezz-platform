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
        className={`w-full bg-primary-400 text-white hover:bg-primary-600 ${
          loginMutation.isPending ? 'opacity-70 cursor-not-allowed' : ''
        }`}
      >
        {loginMutation.isPending ? t('common.loading') : t('auth.login_button')}
      </Button>

      <div className="flex items-center gap-2">
        <hr className="flex-1 border-tertiary-300" />
        <span className="text-sm text-tertiary-600">{t('common.or')}</span>
        <hr className="flex-1 border-tertiary-300" />
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => {
          window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
        }}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" className="mr-2">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {t('auth.google_button')}
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
