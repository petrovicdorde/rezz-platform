import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/venues/$slug/reservation')({
  component: ReservationPage,
});

function ReservationPage() {
  const { t } = useTranslation();
  return <div className="p-8"><h1 className="text-2xl font-bold">Reservation</h1></div>;
}
