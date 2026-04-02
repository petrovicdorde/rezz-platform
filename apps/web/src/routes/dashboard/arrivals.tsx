import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export const Route = createFileRoute('/dashboard/arrivals')({
  component: ArrivalsPage,
});

function ArrivalsPage(): React.JSX.Element {
  const { t } = useTranslation();
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-primary-400">
        {t('dashboard.menu_arrivals')}
      </h1>
    </DashboardLayout>
  );
}
