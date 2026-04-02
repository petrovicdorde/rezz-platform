export type SettingType = 'CITY' | 'VENUE_TYPE' | 'TABLE_TYPE';

export interface Setting {
  id: string;
  type: SettingType;
  value: string;
  label: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface PublicSetting {
  value: string;
  label: string;
}

export interface CreateSettingRequest {
  type: SettingType;
  value: string;
  label: string;
  isActive?: boolean;
  order?: number;
}

export interface UpdateSettingRequest {
  label?: string;
  value?: string;
  isActive?: boolean;
  order?: number;
}
