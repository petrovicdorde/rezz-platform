import { api } from '@/lib/api';

export type BlacklistAppealStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface BlacklistAppeal {
  id: string;
  userId: string;
  message: string;
  status: BlacklistAppealStatus;
  adminNote: string | null;
  decidedByAdminId: string | null;
  submittedAt: string;
  decidedAt: string | null;
  user?: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    blacklistedAt: string | null;
    blacklistReason: string | null;
  };
}

export interface SubmitAppealPayload {
  message: string;
}

export interface DecideAppealPayload {
  status: 'APPROVED' | 'REJECTED';
  adminNote?: string;
}

export const blacklistAppealsApi = {
  // Guest
  getMine: async (): Promise<BlacklistAppeal | null> => {
    const res = await api.get<BlacklistAppeal | null>(
      '/profile/blacklist-appeal',
    );
    return res.data;
  },

  submit: async (data: SubmitAppealPayload): Promise<BlacklistAppeal> => {
    const res = await api.post<BlacklistAppeal>(
      '/profile/blacklist-appeal',
      data,
    );
    return res.data;
  },

  // Super admin
  list: async (
    status: BlacklistAppealStatus = 'PENDING',
  ): Promise<BlacklistAppeal[]> => {
    const res = await api.get<BlacklistAppeal[]>('/admin/blacklist-appeals', {
      params: { status },
    });
    return res.data;
  },

  decide: async (
    id: string,
    data: DecideAppealPayload,
  ): Promise<BlacklistAppeal> => {
    const res = await api.patch<BlacklistAppeal>(
      `/admin/blacklist-appeals/${id}`,
      data,
    );
    return res.data;
  },
};
