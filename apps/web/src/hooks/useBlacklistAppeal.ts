import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import i18n from '@/i18n';
import {
  blacklistAppealsApi,
  type BlacklistAppealStatus,
  type DecideAppealPayload,
  type SubmitAppealPayload,
} from '@/lib/api/blacklist-appeals.api';
import { handleApiError } from '@/lib/handle-error';

const MY_APPEAL_KEY = ['my-blacklist-appeal'];
const ADMIN_APPEALS_KEY = (status: BlacklistAppealStatus): unknown[] => [
  'admin-blacklist-appeals',
  status,
];

export function useMyBlacklistAppeal(enabled: boolean) {
  return useQuery({
    queryKey: MY_APPEAL_KEY,
    queryFn: () => blacklistAppealsApi.getMine(),
    enabled,
  });
}

export function useSubmitBlacklistAppeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SubmitAppealPayload) =>
      blacklistAppealsApi.submit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MY_APPEAL_KEY });
      toast.success(i18n.t('blacklist.appeal_submitted'));
    },
    onError: (err) => handleApiError(err),
  });
}

export function useAdminBlacklistAppeals(status: BlacklistAppealStatus) {
  return useQuery({
    queryKey: ADMIN_APPEALS_KEY(status),
    queryFn: () => blacklistAppealsApi.list(status),
  });
}

export function useDecideBlacklistAppeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: DecideAppealPayload;
    }) => blacklistAppealsApi.decide(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['admin-blacklist-appeals'],
      });
      toast.success(
        variables.data.status === 'APPROVED'
          ? i18n.t('blacklist.appeal_approved_toast')
          : i18n.t('blacklist.appeal_rejected_toast'),
      );
    },
    onError: (err) => handleApiError(err),
  });
}
