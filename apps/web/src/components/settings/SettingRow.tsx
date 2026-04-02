import { useTranslation } from 'react-i18next';
import { ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import type { Setting } from '@/lib/types/settings.types';

interface SettingRowProps {
  setting: Setting;
  onToggleActive: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

export function SettingRow({
  setting,
  onToggleActive,
  onDelete,
  isUpdating,
  isDeleting,
}: SettingRowProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between border-b border-tertiary-100 px-4 py-3 transition-colors last:border-0 hover:bg-tertiary-50">
      <div className="flex items-center gap-3">
        <span
          className={`h-2 w-2 flex-shrink-0 rounded-full ${
            setting.isActive ? 'bg-green-400' : 'bg-tertiary-300'
          }`}
        />
        <span className="text-sm font-medium text-secondary-600">
          {setting.label}
        </span>
        <span className="ml-1 font-mono text-xs text-tertiary-400">
          ({setting.value})
        </span>
        <span className="ml-2 rounded bg-tertiary-100 px-1.5 py-0.5 text-xs text-tertiary-500">
          {setting.order}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          disabled={isUpdating}
          onClick={() => onToggleActive(setting.id, !setting.isActive)}
          className={`flex items-center gap-1 rounded-md border px-2 py-1 text-xs transition-colors ${
            setting.isActive
              ? 'border-amber-200 text-amber-500 hover:bg-amber-50 hover:text-amber-600'
              : 'border-tertiary-200 text-tertiary-400 hover:bg-green-50 hover:text-green-600'
          }`}
        >
          {setting.isActive ? (
            <>
              <ToggleRight size={14} />
              {t('settings.active_label')}
            </>
          ) : (
            <>
              <ToggleLeft size={14} />
              {t('settings.inactive_label')}
            </>
          )}
        </button>
        <button
          disabled={isDeleting}
          onClick={() => onDelete(setting.id)}
          className="rounded p-1.5 text-tertiary-300 transition-colors hover:bg-red-50 hover:text-red-500"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
