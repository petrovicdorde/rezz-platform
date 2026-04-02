import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SettingRow } from './SettingRow';
import { AddSettingForm } from './AddSettingForm';
import {
  useAdminSettings,
  useUpdateSetting,
  useDeleteSetting,
} from '@/hooks/useSettings';
import type { SettingType } from '@/lib/types/settings.types';

interface SettingsTabContentProps {
  type: SettingType;
  addLabel: string;
}

export function SettingsTabContent({
  type,
  addLabel,
}: SettingsTabContentProps): React.JSX.Element {
  const { t } = useTranslation();
  const [isAdding, setIsAdding] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const { data: settings, isLoading } = useAdminSettings(type);
  const updateSetting = useUpdateSetting();
  const deleteSetting = useDeleteSetting();

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-tertiary-500">
          {settings?.length ?? 0} stavki
        </span>
        {!isAdding && (
          <Button
            size="sm"
            className="bg-primary-400 text-white hover:bg-primary-600"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            {addLabel}
          </Button>
        )}
      </div>

      {/* Add form */}
      {isAdding && (
        <AddSettingForm
          type={type}
          onSuccess={() => setIsAdding(false)}
          onCancel={() => setIsAdding(false)}
        />
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-12 animate-pulse rounded bg-tertiary-200"
            />
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && (!settings || settings.length === 0) && (
        <p className="py-12 text-center text-sm text-tertiary-400">
          {t('settings.no_settings')}
        </p>
      )}

      {/* List */}
      {!isLoading && settings && settings.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-tertiary-200 bg-white">
          {settings.map((setting) => (
            <SettingRow
              key={setting.id}
              setting={setting}
              onToggleActive={(id, isActive) =>
                updateSetting.mutate({ id, data: { isActive } })
              }
              onDelete={(id) => setConfirmDeleteId(id)}
              isUpdating={updateSetting.isPending}
              isDeleting={deleteSetting.isPending}
            />
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('settings.delete_confirm')}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmDeleteId(null)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={deleteSetting.isPending}
              onClick={() => {
                if (!confirmDeleteId) return;
                deleteSetting.mutate(confirmDeleteId, {
                  onSuccess: () => setConfirmDeleteId(null),
                });
              }}
            >
              {deleteSetting.isPending
                ? t('common.loading')
                : t('settings.delete_confirm_yes')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
