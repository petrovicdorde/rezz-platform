import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  contactApi,
  type ContactFormPayload,
} from '@/lib/api/contact.api';
import { handleApiError } from '@/lib/handle-error';

const FIELD_INPUT =
  'h-11 rounded-xl border border-white/25 bg-white/15 px-4 text-white shadow-none transition-all placeholder:text-white/55 hover:bg-white/20 hover:border-white/45 focus-visible:border-white/65 focus-visible:bg-white/25 focus-visible:shadow-[0_2px_12px_rgba(0,0,0,0.12)]';

const FIELD_TEXTAREA =
  'rounded-xl border border-white/25 bg-white/15 px-4 py-3 text-white shadow-none transition-all placeholder:text-white/55 hover:bg-white/20 hover:border-white/45 focus-visible:border-white/65 focus-visible:bg-white/25 focus-visible:shadow-[0_2px_12px_rgba(0,0,0,0.12)]';

export function ContactSection(): React.JSX.Element {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<ContactFormPayload>({
    mode: 'onChange',
    defaultValues: { fullName: '', email: '', phone: '', message: '' },
  });

  const mutation = useMutation({
    mutationFn: contactApi.submit,
    onSuccess: (data) => {
      toast.success(data.message ?? t('contact.success'));
      reset();
    },
    onError: (error) => handleApiError(error),
  });

  function onSubmit(values: ContactFormPayload): void {
    mutation.mutate({
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      phone: values.phone?.trim() || undefined,
      message: values.message.trim(),
    });
  }

  return (
    <section className="relative overflow-hidden bg-secondary-400 px-[5%] py-22">
      {/* Soft warm radial wash for depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-10%,rgba(255,255,255,0.12)_0%,transparent_60%),radial-gradient(ellipse_60%_40%_at_100%_100%,rgba(20,11,0,0.18)_0%,transparent_55%)]"
      />

      <div className="relative mx-auto grid w-full max-w-(--breakpoint-2xl) gap-10 md:grid-cols-2 md:gap-16 md:items-center">
        {/* Left — title + copy */}
        <div className="text-center md:text-left">
          <div className="mb-3 text-[0.68rem] font-bold uppercase tracking-[3px] text-white/85">
            {t('contact.label')}
          </div>
          <h2 className="font-serif text-[clamp(2rem,4vw,3.4rem)] leading-[1.05] font-black tracking-[-1px] text-white [text-shadow:0_2px_24px_rgba(20,11,0,0.18)]">
            {t('contact.title_line_1')}
            <br />
            <em className="italic font-black text-white/65">
              {t('contact.title_line_2')}
            </em>
          </h2>
          <p className="mx-auto mt-5 max-w-md text-[1rem] leading-[1.7] font-light text-white/85 md:mx-0">
            {t('contact.subtitle')}
          </p>
        </div>

        {/* Right — glass card form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-3.5 rounded-[26px] border border-white/25 bg-white/12 p-5 shadow-[0_4px_6px_rgba(0,0,0,0.06),0_12px_32px_rgba(0,0,0,0.18),0_32px_64px_rgba(20,11,0,0.18)] backdrop-blur-md sm:p-7"
          style={{ WebkitBackdropFilter: 'blur(20px)' }}
        >
          <div>
            <label
              htmlFor="contact-fullName"
              className="mb-1.5 block text-sm font-medium text-white"
            >
              {t('contact.fullname_label')}
            </label>
            <Input
              id="contact-fullName"
              className={FIELD_INPUT}
              placeholder={t('contact.fullname_placeholder')}
              {...register('fullName', {
                required: t('contact.required'),
                minLength: { value: 2, message: t('contact.min_length_2') },
              })}
            />
            {errors.fullName && (
              <p className="mt-1 text-xs text-white/95">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="contact-email"
                className="mb-1.5 block text-sm font-medium text-white"
              >
                {t('contact.email_label')}
              </label>
              <Input
                id="contact-email"
                type="email"
                className={FIELD_INPUT}
                placeholder={t('contact.email_placeholder')}
                {...register('email', {
                  required: t('contact.required'),
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: t('contact.email_invalid'),
                  },
                })}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-white/95">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="contact-phone"
                className="mb-1.5 block text-sm font-medium text-white"
              >
                {t('contact.phone_label')}
              </label>
              <Input
                id="contact-phone"
                type="tel"
                className={FIELD_INPUT}
                placeholder={t('contact.phone_placeholder')}
                {...register('phone')}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="contact-message"
              className="mb-1.5 block text-sm font-medium text-white"
            >
              {t('contact.message_label')}
            </label>
            <Textarea
              id="contact-message"
              className={FIELD_TEXTAREA}
              rows={5}
              placeholder={t('contact.message_placeholder')}
              {...register('message', {
                required: t('contact.required'),
                minLength: { value: 10, message: t('contact.min_length_10') },
              })}
            />
            {errors.message && (
              <p className="mt-1 text-xs text-white/95">
                {errors.message.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={mutation.isPending || !isValid}
            className="group relative mt-1 w-full overflow-hidden rounded-xl bg-[#140B00] px-4 py-3.5 text-base font-bold tracking-[0.3px] text-white shadow-[0_4px_12px_rgba(20,11,0,0.4),0_8px_28px_rgba(20,11,0,0.25)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(20,11,0,0.5),0_16px_40px_rgba(20,11,0,0.3)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/15 to-transparent transition-transform duration-550 group-hover:translate-x-full"
            />
            <span className="relative">
              {mutation.isPending
                ? t('contact.sending')
                : t('contact.submit')}
            </span>
          </button>
        </form>
      </div>
    </section>
  );
}
