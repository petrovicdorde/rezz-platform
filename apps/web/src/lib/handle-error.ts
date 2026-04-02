import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import i18n from '@/i18n';

interface ApiError {
  message: string | string[];
  statusCode: number;
}

export function handleApiError(
  error: unknown,
  fallbackKey = 'auth.generic_error',
): void {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiError | undefined;
    const message = data?.message;

    if (Array.isArray(message)) {
      message.forEach((msg) => toast.error(msg));
      return;
    }

    if (typeof message === 'string') {
      const translated = i18n.t(message, { defaultValue: message });
      toast.error(translated);
      return;
    }
  }

  toast.error(i18n.t(fallbackKey));
}
