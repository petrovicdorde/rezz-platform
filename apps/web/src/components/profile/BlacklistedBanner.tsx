import { useTranslation } from 'react-i18next';
import { ShieldAlert } from 'lucide-react';

interface BlacklistedBannerProps {
  reason?: string | null;
  className?: string;
}

const SUPPORT_EMAIL =
  import.meta.env.VITE_SUPPORT_EMAIL ?? 'support@rezz.ba';

export function BlacklistedBanner({
  reason,
  className,
}: BlacklistedBannerProps): React.JSX.Element {
  const { t } = useTranslation();
  const subject = encodeURIComponent(t('blacklist.support_subject'));
  return (
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
        <a
          href={`mailto:${SUPPORT_EMAIL}?subject=${subject}`}
          className="mt-2 inline-block font-medium text-red-700 underline hover:text-red-900"
        >
          {t('blacklist.contact_support', { email: SUPPORT_EMAIL })}
        </a>
      </div>
    </div>
  );
}
