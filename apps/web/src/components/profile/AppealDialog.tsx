import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useSubmitBlacklistAppeal } from '@/hooks/useBlacklistAppeal';

interface AppealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AppealForm {
  message: string;
}

const FIELD_TEXTAREA =
  'rounded-xl border-[rgba(20,11,0,0.07)] bg-[#F5F1EB] px-4 py-3 text-[#140B00] shadow-none transition-all placeholder:text-[rgba(20,11,0,0.42)] hover:bg-white hover:border-[rgba(249,133,19,0.35)] focus-visible:border-[rgba(249,133,19,0.55)] focus-visible:bg-white focus-visible:shadow-[0_2px_12px_rgba(249,133,19,0.12)]';

const ORANGE_CTA =
  'group relative w-full overflow-hidden rounded-xl bg-linear-to-br from-secondary-400 to-secondary-500 px-4 py-3.5 text-base font-bold tracking-[0.3px] text-white shadow-[0_4px_12px_rgba(249,133,19,0.3),0_8px_28px_rgba(249,133,19,0.2)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(249,133,19,0.4),0_16px_40px_rgba(249,133,19,0.2)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0';

export function AppealDialog({
  open,
  onOpenChange,
}: AppealDialogProps): React.JSX.Element {
  const { t } = useTranslation();
  const mutation = useSubmitBlacklistAppeal();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<AppealForm>({
    mode: 'onChange',
    defaultValues: { message: '' },
  });

  // Clear the form whenever the dialog re-opens.
  useEffect(() => {
    if (open) reset({ message: '' });
  }, [open, reset]);

  function onSubmit(data: AppealForm): void {
    mutation.mutate(
      { message: data.message.trim() },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md rounded-2xl border-[rgba(20,11,0,0.06)] bg-[rgba(253,249,244,0.98)] p-7 shadow-[0_0_0_1px_rgba(20,11,0,0.04),0_8px_16px_rgba(20,11,0,0.08),0_24px_48px_rgba(20,11,0,0.18),0_48px_72px_rgba(20,11,0,0.16)]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-bold tracking-[-0.4px] text-[#140B00]">
            {t('blacklist.appeal_dialog_title')}
          </DialogTitle>
          <DialogDescription className="text-sm text-[rgba(20,11,0,0.55)]">
            {t('blacklist.appeal_dialog_subtitle')}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <div>
            <label
              htmlFor="appeal-message"
              className="mb-1.5 block text-sm font-medium text-[#140B00]"
            >
              {t('blacklist.appeal_message_label')}
            </label>
            <Textarea
              id="appeal-message"
              rows={5}
              className={FIELD_TEXTAREA}
              placeholder={t('blacklist.appeal_message_placeholder')}
              {...register('message', {
                required: t('blacklist.appeal_required'),
                minLength: {
                  value: 10,
                  message: t('blacklist.appeal_min_length'),
                },
              })}
            />
            {errors.message && (
              <p className="mt-1 text-xs text-red-500">
                {errors.message.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={mutation.isPending || !isValid}
            className={ORANGE_CTA}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-550 group-hover:translate-x-full"
            />
            <span className="relative">
              {mutation.isPending
                ? t('common.loading')
                : t('blacklist.appeal_submit')}
            </span>
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
