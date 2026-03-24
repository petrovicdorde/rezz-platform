import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/dashboard/venues')({
  component: VenuesManagementPage,
});

function VenuesManagementPage() {
  const { t } = useTranslation();
  return <div className="p-8"><h1 className="text-2xl font-bold">{t('nav.venues')}</h1></div>;
}
