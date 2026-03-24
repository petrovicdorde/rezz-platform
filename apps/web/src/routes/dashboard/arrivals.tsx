import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/dashboard/arrivals')({
  component: ArrivalsPage,
});

function ArrivalsPage() {
  const { t } = useTranslation();
  return <div className="p-8"><h1 className="text-2xl font-bold">Arrivals</h1></div>;
}
