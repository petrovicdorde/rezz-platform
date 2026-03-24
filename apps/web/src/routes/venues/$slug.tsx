import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/venues/$slug')({
  component: VenueDetailPage,
});

function VenueDetailPage() {
  const { t } = useTranslation();
  const { slug } = Route.useParams();
  return <div className="p-8"><h1 className="text-2xl font-bold">{slug}</h1></div>;
}
