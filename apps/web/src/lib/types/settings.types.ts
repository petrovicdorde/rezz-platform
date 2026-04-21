export type SettingType = 'CITY' | 'VENUE_TYPE' | 'TABLE_TYPE';

export interface Setting {
  id: string;
  type: SettingType;
  value: string;
  label: string;
  labelEn: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface PublicSetting {
  value: string;
  label: string;
  labelEn: string;
}

export interface CreateSettingRequest {
  type: SettingType;
  value: string;
  label: string;
  labelEn?: string;
  isActive?: boolean;
  order?: number;
}

export interface UpdateSettingRequest {
  label?: string;
  labelEn?: string;
  value?: string;
  isActive?: boolean;
  order?: number;
}
