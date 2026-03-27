import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ManagerForm } from './ManagerForm';
import type { AdminVenue } from '@/lib/types/venue.types';

interface ManagerTabProps {
  venue: AdminVenue;
}

export function ManagerTab({ venue }: ManagerTabProps): React.JSX.Element {
  const { t } = useTranslation();
  const [isReplacing, setIsReplacing] = useState(false);

  if (isReplacing) {
    return (
      <ManagerForm
        venueId={venue.id}
        hasExistingManager={!!venue.manager}
        onSuccess={() => setIsReplacing(false)}
        onCancel={() => setIsReplacing(false)}
      />
    );
  }

  return (
    <div>
      <p className="mb-3 text-sm font-medium uppercase tracking-wide text-tertiary-600">
        {t('venue.manager_current')}
      </p>

      {venue.manager ? (
        <>
          <div className="rounded-lg border bg-tertiary-50 p-4">
            <p className="font-medium text-secondary-600">
              {venue.manager.firstName || venue.manager.lastName
                ? `${venue.manager.firstName ?? ''} ${venue.manager.lastName ?? ''}`.trim()
                : venue.manager.email}
            </p>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-tertiary-600">
              <Mail className="h-3.5 w-3.5" />
              <span>{venue.manager.email}</span>
            </div>
            {venue.manager.phone && (
              <div className="mt-1 flex items-center gap-1.5 text-sm text-tertiary-600">
                <Phone className="h-3.5 w-3.5" />
                <span>{venue.manager.phone}</span>
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            className="mt-3 w-full border-tertiary-300 text-tertiary-600 hover:bg-tertiary-100"
            onClick={() => setIsReplacing(true)}
          >
            <UserX className="mr-2 h-4 w-4" />
            {t('venue.manager_replace')}
          </Button>
        </>
      ) : (
        <div className="py-6">
          <UserX className="mx-auto h-10 w-10 text-tertiary-300" />
          <p className="mt-2 text-center text-sm text-tertiary-400">
            {t('venue.manager_none')}
          </p>
          <Button
            type="button"
            className="mt-4 w-full bg-primary-400 text-primary-900 hover:bg-primary-600"
            onClick={() => setIsReplacing(true)}
          >
            {t('venue.manager_add')}
          </Button>
        </div>
      )}
    </div>
  );
}
