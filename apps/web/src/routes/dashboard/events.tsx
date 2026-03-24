import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/dashboard/events')({
  component: EventsPage,
});

function EventsPage() {
  const { t } = useTranslation();
  return <div className="p-8"><h1 className="text-2xl font-bold">Events</h1></div>;
}
