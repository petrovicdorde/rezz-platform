import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/auth/verify-email')({
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const { t } = useTranslation();
  return <div className="p-8"><h1 className="text-2xl font-bold">Verify Email</h1></div>;
}
