import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { settingsApi } from '@/lib/api/settings.api';
import { handleApiError } from '@/lib/handle-error';
import i18n from '@/i18n';
import type {
  SettingType,
  CreateSettingRequest,
  UpdateSettingRequest,
} from '@/lib/types/settings.types';

export function resolveSettingLabel(
  s: { label: string; labelEn?: string | null },
  language: string,
): string {
  if (language.startsWith('en') && s.labelEn && s.labelEn.trim()) {
    return s.labelEn;
  }
  return s.label;
}

export function useSettingLabel() {
  const { i18n: i18nInstance } = useTranslation();
  return (s: { label: string; labelEn?: string | null }): string =>
    resolveSettingLabel(s, i18nInstance.language);
}

export function useSettingValueLabel(type: SettingType) {
  const { data: options } = usePublicSettings(type);
  const { i18n: i18nInstance } = useTranslation();
  return (value: string): string => {
    if (!value) return '';
    const match = options?.find((o) => o.value === value);
    if (match) return resolveSettingLabel(match, i18nInstance.language);
    return value;
  };
}

export function useAdminSettings(type?: SettingType) {
  return useQuery({
    queryKey: ['settings', type],
    queryFn: () => settingsApi.getAll(type),
  });
}

export function usePublicSettings(type: SettingType) {
  return useQuery({
    queryKey: ['settings-public', type],
    queryFn: () => settingsApi.getPublic(type),
    staleTime: 1000 * 60 * 10,
  });
}

export function useCreateSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSettingRequest) => settingsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['settings-public'] });
      toast.success(i18n.t('settings.created'));
    },
    onError: (error: unknown) => handleApiError(error),
  });
}

export function useUpdateSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSettingRequest }) =>
      settingsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['settings-public'] });
      toast.success(i18n.t('settings.updated'));
    },
    onError: (error: unknown) => handleApiError(error),
  });
}

export function useDeleteSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => settingsApi.remove(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['settings-public'] });
      toast.success(res.message);
    },
    onError: (error: unknown) => handleApiError(error),
  });
}
