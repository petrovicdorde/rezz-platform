import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { useMyBlacklistAppeal } from '@/hooks/useBlacklistAppeal';
import { AppealDialog } from './AppealDialog';

interface BlacklistedBannerProps {
  reason?: string | null;
  className?: string;
}

const SUPPORT_EMAIL =
  import.meta.env.VITE_SUPPORT_EMAIL ?? 'support@rezz.ba';

const REJECTION_COOLDOWN_MS = 24 * 60 * 60 * 1000;

export function BlacklistedBanner({
  reason,
  className,
}: BlacklistedBannerProps): React.JSX.Element {
  const { t } = useTranslation();
  const [appealOpen, setAppealOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const { data: appeal, isLoading: appealLoading } =
    useMyBlacklistAppeal(true);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  let cooldownRemainingMs = 0;
  if (appeal && appeal.status === 'REJECTED' && appeal.decidedAt) {
    const elapsed = now - new Date(appeal.decidedAt).getTime();
    cooldownRemainingMs = Math.max(0, REJECTION_COOLDOWN_MS - elapsed);
  }
  const inCooldown = cooldownRemainingMs > 0;
  const cooldownHours = Math.ceil(cooldownRemainingMs / (60 * 60 * 1000));

  const isPending = appeal?.status === 'PENDING';
  const isRejectedFresh = appeal?.status === 'REJECTED' && inCooldown;
  const canSubmitAppeal = !appealLoading && !isPending && !inCooldown;

  const subject = encodeURIComponent(t('blacklist.support_subject'));

  return (
    <>
      <div
        className={`flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 ${
          className ?? ''
        }`}
      >
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
        <div className="flex-1 text-sm text-red-700">
          <p className="font-medium">{t('blacklist.title')}</p>
          <p className="mt-1">{t('blacklist.description')}</p>
          {reason && (
            <p className="mt-1 italic text-red-600">
              {t('blacklist.reason_label')}: {reason}
            </p>
          )}

          {isPending && (
            <p className="mt-3 rounded-lg bg-red-100/80 px-3 py-2 text-xs text-red-800">
              {t('blacklist.appeal_pending_banner')}
            </p>
          )}
          {isRejectedFresh && (
            <div className="mt-3 rounded-lg bg-red-100/80 px-3 py-2 text-xs text-red-800">
              <p className="font-medium">
                {t('blacklist.appeal_rejected_banner')}
              </p>
              {appeal?.adminNote && (
                <p className="mt-1 italic">
                  {t('blacklist.appeal_admin_note')}: {appeal.adminNote}
                </p>
              )}
              <p className="mt-1">
                {t('blacklist.appeal_cooldown_remaining', {
                  hours: cooldownHours,
                })}
              </p>
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-3">
            {canSubmitAppeal && (
              <button
                type="button"
                onClick={() => setAppealOpen(true)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-red-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-red-700 transition-all hover:-translate-y-px hover:border-red-400 hover:bg-red-50 hover:shadow-[0_2px_12px_rgba(239,68,68,0.15)]"
              >
                {appealLoading && (
                  <Loader2 className="h-3 w-3 animate-spin" />
                )}
                {t('blacklist.appeal_button')}
              </button>
            )}
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=${subject}`}
              className="text-xs font-medium text-red-700 underline hover:text-red-900"
            >
              {t('blacklist.contact_support', { email: SUPPORT_EMAIL })}
            </a>
          </div>
        </div>
      </div>

      <AppealDialog open={appealOpen} onOpenChange={setAppealOpen} />
    </>
  );
}
