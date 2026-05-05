import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { Loader2, ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  useAdminBlacklistAppeals,
  useDecideBlacklistAppeal,
} from '@/hooks/useBlacklistAppeal';
import type {
  BlacklistAppeal,
  BlacklistAppealStatus,
} from '@/lib/api/blacklist-appeals.api';

const STATUSES: BlacklistAppealStatus[] = ['PENDING', 'APPROVED', 'REJECTED'];

export function BlacklistAppealsSection(): React.JSX.Element {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<BlacklistAppealStatus>('PENDING');
  const { data: appeals, isLoading } = useAdminBlacklistAppeals(filter);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-all ${
              filter === s
                ? 'bg-primary-400 text-white shadow-[0_2px_8px_rgba(17,17,68,0.25)]'
                : 'border border-[rgba(20,11,0,0.08)] bg-white text-[rgba(20,11,0,0.6)] hover:border-[rgba(17,17,68,0.25)] hover:text-primary-400'
            }`}
          >
            {t(`appeals.filter_${s.toLowerCase()}`)}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-tertiary-400" />
        </div>
      )}

      {!isLoading && (!appeals || appeals.length === 0) && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[rgba(20,11,0,0.06)] bg-white py-16 text-center">
          <ShieldAlert className="size-10 text-tertiary-300" />
          <p className="mt-3 text-sm text-tertiary-500">
            {t(`appeals.empty_${filter.toLowerCase()}`)}
          </p>
        </div>
      )}

      {!isLoading && appeals && appeals.length > 0 && (
        <div className="flex flex-col gap-3">
          {appeals.map((a) => (
            <AppealCard key={a.id} appeal={a} />
          ))}
        </div>
      )}
    </div>
  );
}

interface AppealCardProps {
  appeal: BlacklistAppeal;
}

function AppealCard({ appeal }: AppealCardProps): React.JSX.Element {
  const { t } = useTranslation();
  const [confirm, setConfirm] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const decideMutation = useDecideBlacklistAppeal();

  const fullName = [appeal.user?.firstName, appeal.user?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();

  function openConfirm(status: 'APPROVED' | 'REJECTED'): void {
    setConfirm(status);
    setAdminNote('');
  }

  function closeConfirm(): void {
    if (decideMutation.isPending) return;
    setConfirm(null);
  }

  function submitDecision(): void {
    if (!confirm) return;
    decideMutation.mutate(
      {
        id: appeal.id,
        data: {
          status: confirm,
          adminNote: adminNote.trim() || undefined,
        },
      },
      { onSuccess: () => setConfirm(null) },
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-[rgba(20,11,0,0.06)] bg-white p-5 shadow-[0_1px_2px_rgba(20,11,0,0.04),0_4px_12px_rgba(20,11,0,0.05)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold text-[#140B00]">
              {fullName || t('appeals.unknown_guest')}
            </p>
            <p className="text-xs text-[rgba(20,11,0,0.55)]">
              {appeal.user?.email}
            </p>
          </div>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              appeal.status === 'PENDING'
                ? 'bg-amber-100 text-amber-700'
                : appeal.status === 'APPROVED'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-red-100 text-red-600'
            }`}
          >
            {t(`appeals.filter_${appeal.status.toLowerCase()}`)}
          </span>
        </div>

        {appeal.user?.blacklistReason && (
          <div className="mt-3 rounded-lg bg-[rgba(20,11,0,0.03)] p-3 text-xs">
            <p className="font-semibold uppercase tracking-[1px] text-[rgba(20,11,0,0.45)]">
              {t('appeals.blacklist_reason')}
            </p>
            <p className="mt-1 italic text-[rgba(20,11,0,0.7)]">
              {appeal.user.blacklistReason}
            </p>
          </div>
        )}

        <div className="mt-3 rounded-lg border border-[rgba(17,17,68,0.08)] bg-[rgba(17,17,68,0.02)] p-3 text-sm">
          <p className="text-xs font-semibold uppercase tracking-[1px] text-[rgba(17,17,68,0.5)]">
            {t('appeals.guest_message')}
          </p>
          <p className="mt-1 whitespace-pre-wrap text-[#140B00]">
            {appeal.message}
          </p>
        </div>

        <p className="mt-3 text-xs text-[rgba(20,11,0,0.45)]">
          {t('appeals.submitted_at', {
            date: format(parseISO(appeal.submittedAt), 'dd.MM.yyyy HH:mm'),
          })}
        </p>

        {appeal.adminNote && appeal.status !== 'PENDING' && (
          <div className="mt-3 rounded-lg bg-[rgba(20,11,0,0.03)] p-3 text-xs">
            <p className="font-semibold uppercase tracking-[1px] text-[rgba(20,11,0,0.45)]">
              {t('appeals.admin_note')}
            </p>
            <p className="mt-1 whitespace-pre-wrap italic text-[rgba(20,11,0,0.7)]">
              {appeal.adminNote}
            </p>
          </div>
        )}

        {appeal.status === 'PENDING' && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => openConfirm('APPROVED')}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-linear-to-br from-secondary-400 to-secondary-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(249,133,19,0.3)] transition-all hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(249,133,19,0.4)]"
            >
              <ShieldCheck className="size-4" />
              {t('appeals.approve_cta')}
            </button>
            <button
              type="button"
              onClick={() => openConfirm('REJECTED')}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition-all hover:-translate-y-px hover:bg-red-50"
            >
              <ShieldX className="size-4" />
              {t('appeals.reject_cta')}
            </button>
          </div>
        )}
      </div>

      <Dialog open={confirm !== null} onOpenChange={closeConfirm}>
        <DialogContent className="w-full max-w-md rounded-2xl border-[rgba(20,11,0,0.06)] bg-[rgba(253,249,244,0.98)] p-7 shadow-[0_0_0_1px_rgba(20,11,0,0.04),0_8px_16px_rgba(20,11,0,0.08),0_24px_48px_rgba(20,11,0,0.18),0_48px_72px_rgba(20,11,0,0.16)]">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl font-bold tracking-[-0.4px] text-[#140B00]">
              {confirm === 'APPROVED'
                ? t('appeals.confirm_approve_title')
                : t('appeals.confirm_reject_title')}
            </DialogTitle>
            <DialogDescription className="text-sm text-[rgba(20,11,0,0.55)]">
              {confirm === 'APPROVED'
                ? t('appeals.confirm_approve_subtitle')
                : t('appeals.confirm_reject_subtitle')}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#140B00]">
                {t('appeals.admin_note_label')}
              </label>
              <Textarea
                rows={3}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder={
                  confirm === 'APPROVED'
                    ? t('appeals.admin_note_placeholder_approve')
                    : t('appeals.admin_note_placeholder_reject')
                }
                className="rounded-xl border-[rgba(20,11,0,0.07)] bg-[#F5F1EB] px-4 py-3 text-[#140B00] shadow-none transition-all placeholder:text-[rgba(20,11,0,0.42)] hover:bg-white hover:border-[rgba(249,133,19,0.35)] focus-visible:border-[rgba(249,133,19,0.55)] focus-visible:bg-white focus-visible:shadow-[0_2px_12px_rgba(249,133,19,0.12)]"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeConfirm}
                disabled={decideMutation.isPending}
                className="cursor-pointer rounded-xl border border-[rgba(20,11,0,0.1)] px-4 py-2.5 text-sm font-semibold text-[#140B00] transition-colors hover:bg-[rgba(20,11,0,0.04)] disabled:opacity-60"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={submitDecision}
                disabled={decideMutation.isPending}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 ${
                  confirm === 'APPROVED'
                    ? 'bg-linear-to-br from-secondary-400 to-secondary-500 shadow-[0_2px_8px_rgba(249,133,19,0.3)] hover:shadow-[0_4px_16px_rgba(249,133,19,0.4)]'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {decideMutation.isPending && (
                  <Loader2 className="size-3.5 animate-spin" />
                )}
                {confirm === 'APPROVED'
                  ? t('appeals.confirm_approve_cta')
                  : t('appeals.confirm_reject_cta')}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
