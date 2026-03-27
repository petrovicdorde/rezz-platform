import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { VenueForm } from './VenueForm';
import { ManagerTab } from './ManagerTab';
import { useDeleteVenue, useToggleVenueStatus } from '@/hooks/useVenues';
import type { AdminVenue } from '@/lib/types/venue.types';

interface VenueDetailContentProps {
  venue: AdminVenue;
  onClose: () => void;
}

export function VenueDetailContent({
  venue,
  onClose,
}: VenueDetailContentProps): React.JSX.Element {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'details' | 'manager'>('details');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);
  const [isStatusConfirm, setIsStatusConfirm] = useState(false);
  const deleteMutation = useDeleteVenue();
  const toggleStatus = useToggleVenueStatus();

  function handleTabChange(value: string): void {
    setActiveTab(value as 'details' | 'manager');
    setIsEditMode(false);
    setIsDeleteConfirm(false);
    setIsStatusConfirm(false);
  }

  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-primary-400">{venue.name}</h2>
        <div className="flex items-center gap-2">
          {activeTab === 'details' && (
            <button
              type="button"
              onClick={() => {
                const next = !isEditMode;
                setIsEditMode(next);
                if (!next) {
                  setIsDeleteConfirm(false);
                  setIsStatusConfirm(false);
                }
              }}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                isEditMode
                  ? 'bg-primary-400 text-white'
                  : 'text-tertiary-600'
              }`}
            >
              {t('venue.edit_mode_label')}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-tertiary-400 hover:text-tertiary-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <Separator className="my-4" />

      {/* Tabs */}
      <div className="mb-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => handleTabChange('details')}
          className={`rounded-lg py-2 text-sm font-medium transition-colors ${
            activeTab === 'details'
              ? 'bg-primary-400 text-white'
              : 'border border-tertiary-300 text-tertiary-600'
          }`}
        >
          {t('venue.tab_details')}
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('manager')}
          className={`rounded-lg py-2 text-sm font-medium transition-colors ${
            activeTab === 'manager'
              ? 'bg-primary-400 text-white'
              : 'border border-tertiary-300 text-tertiary-600'
          }`}
        >
          {t('venue.tab_manager')}
        </button>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>

        <TabsContent value="details">
          {/* Main content */}
          {!isDeleteConfirm && !isStatusConfirm && (
            <VenueForm
              initialData={venue}
              venueId={venue.id}
              isReadOnly={!isEditMode}
              onSuccess={() => {
                setIsEditMode(false);
                onClose();
              }}
            />
          )}

          {/* Bottom area — action buttons */}
          {!isDeleteConfirm && !isStatusConfirm && !isEditMode && (
            <div className="mt-4 flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setIsStatusConfirm(true)}
              >
                {venue.isActive ? t('venue.deactivate') : t('venue.activate')}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full border-red-300 text-red-500 hover:bg-red-50"
                onClick={() => setIsDeleteConfirm(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t('venue.delete')}
              </Button>
            </div>
          )}

          {/* Status confirm */}
          {isStatusConfirm && (
            <div className="mt-4">
              <p className="mb-3 text-center text-sm font-medium text-secondary-600">
                {venue.isActive
                  ? t('venue.deactivate_confirm')
                  : t('venue.activate_confirm')}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  className="w-full bg-green-600 text-white hover:bg-green-700"
                  disabled={toggleStatus.isPending}
                  onClick={() =>
                    toggleStatus.mutate(
                      { id: venue.id, isActive: !venue.isActive },
                      { onSuccess: onClose },
                    )
                  }
                >
                  {toggleStatus.isPending
                    ? t('common.loading')
                    : t('common.confirm')}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsStatusConfirm(false)}
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </div>
          )}

          {/* Delete confirm */}
          {isDeleteConfirm && (
            <div className="mt-4">
              <p className="mb-3 text-center text-sm font-medium text-secondary-600">
                Da li ste sigurni?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  className="w-full bg-red-600 text-white hover:bg-red-700"
                  disabled={deleteMutation.isPending}
                  onClick={() =>
                    deleteMutation.mutate(venue.id, { onSuccess: onClose })
                  }
                >
                  {deleteMutation.isPending
                    ? t('common.loading')
                    : t('venue.delete_confirm_yes')}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsDeleteConfirm(false)}
                >
                  {t('venue.delete_confirm_no')}
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="manager">
          <ManagerTab venue={venue} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
