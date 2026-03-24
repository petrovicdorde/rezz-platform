import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/dashboard/reservations')({
  component: ReservationsPage,
});

function ReservationsPage() {
  const { t } = useTranslation();
  return <div className="p-8"><h1 className="text-2xl font-bold">Reservations</h1></div>;
}
