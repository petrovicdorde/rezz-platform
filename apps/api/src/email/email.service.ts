import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { Resend } from 'resend';

interface EmailButton {
  href: string;
  label: string;
  variant?: 'primary' | 'secondary';
}

interface EmailCallout {
  label?: string;
  content: string;
  tone?: 'neutral' | 'warning';
}

interface RenderOpts {
  greeting?: string;
  body: string;
  callout?: EmailCallout;
  buttons?: EmailButton[];
  extraHtml?: string;
  footer?: string;
}

const COLORS = {
  bg: '#F5F1EB',
  card: '#FFFFFF',
  text: '#140B00',
  textMuted: 'rgba(20,11,0,0.55)',
  textSubtle: 'rgba(20,11,0,0.45)',
  divider: 'rgba(20,11,0,0.06)',
  orange: '#F98513',
  orangeDark: '#E97A0E',
  cream: '#F5F1EB',
  warningBg: '#FFF4E5',
};

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

@Injectable()
export class EmailService {
  private readonly resend: Resend;
  private readonly fromEmail: string;
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly i18n: I18nService,
  ) {
    this.resend = new Resend(this.configService.get<string>('RESEND_API_KEY'));
    this.fromEmail = this.configService.get<string>(
      'RESEND_FROM_EMAIL',
      'onboarding@resend.dev',
    );
  }

  // ---------------------------------------------------------------------------
  // Branded template helpers
  // ---------------------------------------------------------------------------

  private renderButton(btn: EmailButton): string {
    const isPrimary = btn.variant !== 'secondary';
    const bg = isPrimary ? COLORS.orange : COLORS.cream;
    const color = isPrimary ? '#FFFFFF' : COLORS.text;
    const border = isPrimary
      ? `2px solid ${COLORS.orange}`
      : `2px solid ${COLORS.divider}`;
    return `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 8px;">
        <tr>
          <td align="center" style="background:${bg};border-radius:12px;border:${border};">
            <a href="${btn.href}"
               style="display:inline-block;padding:13px 28px;font-family:inherit;font-size:15px;font-weight:600;color:${color};text-decoration:none;letter-spacing:0.2px;line-height:1;">
              ${btn.label}
            </a>
          </td>
        </tr>
      </table>
    `;
  }

  private renderButtonsRow(buttons: EmailButton[]): string {
    if (buttons.length === 0) return '';
    const cells = buttons
      .map((b) => `<td style="padding:0 4px;">${this.renderButton(b)}</td>`)
      .join('');
    return `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:28px auto 8px;">
        <tr>${cells}</tr>
      </table>
    `;
  }

  private renderCallout(callout: EmailCallout): string {
    const accent =
      callout.tone === 'warning' ? COLORS.orange : COLORS.orangeDark;
    return `
      <div style="background:${COLORS.cream};border-left:4px solid ${accent};padding:14px 16px;border-radius:10px;margin:20px 0;">
        ${
          callout.label
            ? `<p style="margin:0 0 6px;font-size:11px;color:${COLORS.textSubtle};text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">${callout.label}</p>`
            : ''
        }
        <p style="margin:0;color:${COLORS.text};font-size:15px;line-height:1.55;white-space:pre-wrap;">${callout.content}</p>
      </div>
    `;
  }

  private renderEmail(opts: RenderOpts): string {
    const greeting = opts.greeting
      ? `<p style="margin:0 0 16px;font-size:20px;font-weight:600;color:${COLORS.text};line-height:1.35;">${opts.greeting}</p>`
      : '';
    const body = `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${COLORS.text};">${opts.body}</p>`;
    const callout = opts.callout ? this.renderCallout(opts.callout) : '';
    const extra = opts.extraHtml ?? '';
    const buttons = opts.buttons?.length
      ? this.renderButtonsRow(opts.buttons)
      : '';
    const footer = opts.footer
      ? `<p style="margin:28px 0 0;color:${COLORS.textSubtle};font-size:13px;line-height:1.55;">${opts.footer}</p>`
      : '';

    return `<!DOCTYPE html>
<html lang="sr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light">
  <title>Table.ba</title>
</head>
<body style="margin:0;padding:0;background:${COLORS.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${COLORS.text};">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${COLORS.bg};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;background:${COLORS.card};border-radius:20px;overflow:hidden;border:1px solid ${COLORS.divider};">
          <tr>
            <td align="center" style="padding:36px 40px 24px;">
              <span style="font-family:Georgia,'Times New Roman',serif;font-size:32px;font-weight:700;letter-spacing:-0.5px;color:${COLORS.text};">Table</span><span style="font-family:Georgia,'Times New Roman',serif;font-size:32px;font-weight:700;color:${COLORS.orange};">.ba</span>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 8px;">
              <div style="height:1px;background:${COLORS.divider};"></div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 36px;">
              ${greeting}
              ${body}
              ${callout}
              ${extra}
              ${buttons}
              ${footer}
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background:${COLORS.divider};"></div>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:20px 40px 28px;">
              <p style="margin:0;color:${COLORS.textSubtle};font-size:12px;line-height:1.6;">© Table.ba</p>
              <p style="margin:4px 0 0;color:${COLORS.textSubtle};font-size:11px;">team@table.ba</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  private async send(opts: {
    to: string | string[];
    subject: string;
    html: string;
    replyTo?: string;
    errorContext: string;
  }): Promise<void> {
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
        ...(opts.replyTo ? { replyTo: opts.replyTo } : {}),
      });
    } catch (error) {
      const target = Array.isArray(opts.to) ? opts.to.join(', ') : opts.to;
      this.logger.error(
        `Failed to send ${opts.errorContext} email to ${target}`,
        error,
      );
    }
  }

  private firstFrontendUrl(): string {
    const raw =
      this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173') ??
      'http://localhost:5173';
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)[0];
  }

  private backendUrl(): string {
    return this.configService.get<string>(
      'BACKEND_URL',
      'http://localhost:3000',
    );
  }

  // ---------------------------------------------------------------------------
  // Public email senders
  // ---------------------------------------------------------------------------

  async sendVerificationEmail(
    email: string,
    firstName: string,
    token: string,
    lang: string = 'sr',
  ): Promise<void> {
    const verificationLink = `${this.backendUrl()}/auth/verify-email?token=${token}`;

    const html = this.renderEmail({
      greeting: this.i18n.t('email.greeting', { lang, args: { firstName } }),
      body: this.i18n.t('email.verification_body', { lang }),
      buttons: [
        {
          href: verificationLink,
          label: this.i18n.t('email.verification_button', { lang }),
        },
      ],
      footer: this.i18n.t('email.verification_footer', { lang }),
    });

    await this.send({
      to: email,
      subject: this.i18n.t('email.verification_subject', { lang }),
      html,
      errorContext: 'verification',
    });
  }

  async sendPasswordResetEmail(
    email: string,
    firstName: string,
    token: string,
    lang: string = 'sr',
  ): Promise<void> {
    const resetLink = `${this.firstFrontendUrl()}/auth/reset-password?token=${token}`;

    const html = this.renderEmail({
      greeting: this.i18n.t('email.greeting', { lang, args: { firstName } }),
      body: this.i18n.t('email.password_reset_body', { lang }),
      buttons: [
        {
          href: resetLink,
          label: this.i18n.t('email.password_reset_button', { lang }),
        },
      ],
      footer: this.i18n.t('email.password_reset_footer', { lang }),
    });

    await this.send({
      to: email,
      subject: this.i18n.t('email.password_reset_subject', { lang }),
      html,
      errorContext: 'password reset',
    });
  }

  async sendManagerInvitationEmail(
    email: string,
    venueName: string,
    token: string,
    lang: string = 'sr',
  ): Promise<void> {
    const acceptLink = `${this.backendUrl()}/venues/invitations/${token}/accept`;
    const declineLink = `${this.backendUrl()}/venues/invitations/${token}/decline`;

    const html = this.renderEmail({
      body: this.i18n.t('email.manager_invitation_body', {
        lang,
        args: { venueName },
      }),
      buttons: [
        {
          href: acceptLink,
          label: this.i18n.t('email.manager_invitation_button', { lang }),
        },
        {
          href: declineLink,
          label: this.i18n.t('email.manager_invitation_decline_button', {
            lang,
          }),
          variant: 'secondary',
        },
      ],
      footer: this.i18n.t('email.manager_invitation_footer', { lang }),
    });

    await this.send({
      to: email,
      subject: this.i18n.t('email.manager_invitation_subject', {
        lang,
        args: { venueName },
      }),
      html,
      errorContext: 'manager invitation',
    });
  }

  async sendWorkerInvitationEmail(
    email: string,
    venueName: string,
    token: string,
    lang: string = 'sr',
  ): Promise<void> {
    const acceptLink = `${this.backendUrl()}/venues/invitations/${token}/accept`;

    const html = this.renderEmail({
      body: this.i18n.t('email.worker_invitation_body', {
        lang,
        args: { venueName },
      }),
      buttons: [
        {
          href: acceptLink,
          label: this.i18n.t('email.worker_invitation_button', { lang }),
        },
      ],
      footer: this.i18n.t('email.worker_invitation_footer', { lang }),
    });

    await this.send({
      to: email,
      subject: this.i18n.t('email.worker_invitation_subject', {
        lang,
        args: { venueName },
      }),
      html,
      errorContext: 'worker invitation',
    });
  }

  async sendReservationCancelledEmail(
    email: string,
    venueName: string,
    date: string,
    time: string,
    reason: string,
    lang: string = 'sr',
  ): Promise<void> {
    const html = this.renderEmail({
      body: this.i18n.t('email.reservation_cancelled_body', {
        lang,
        args: { venueName, date, time },
      }),
      callout: {
        content: escapeHtml(
          this.i18n.t('email.reservation_cancelled_reason', {
            lang,
            args: { reason },
          }),
        ),
        tone: 'warning',
      },
      footer: this.i18n.t('email.reservation_cancelled_footer', { lang }),
    });

    await this.send({
      to: email,
      subject: this.i18n.t('email.reservation_cancelled_subject', { lang }),
      html,
      errorContext: 'reservation cancelled',
    });
  }

  async sendReservationConfirmedEmail(
    email: string,
    venueName: string,
    date: string,
    time: string,
    lang: string = 'sr',
  ): Promise<void> {
    const html = this.renderEmail({
      body: this.i18n.t('email.reservation_confirmed_body', {
        lang,
        args: { venueName, date, time },
      }),
      footer: this.i18n.t('email.reservation_confirmed_footer', { lang }),
    });

    await this.send({
      to: email,
      subject: this.i18n.t('email.reservation_confirmed_subject', { lang }),
      html,
      errorContext: 'reservation confirmed',
    });
  }

  async sendReservationRejectedEmail(
    email: string,
    venueName: string,
    date: string,
    time: string,
    reason: string | null,
    lang: string = 'sr',
  ): Promise<void> {
    const callout = reason
      ? {
          content: escapeHtml(
            this.i18n.t('email.reservation_rejected_reason', {
              lang,
              args: { reason },
            }),
          ),
          tone: 'warning' as const,
        }
      : undefined;

    const html = this.renderEmail({
      body: this.i18n.t('email.reservation_rejected_body', {
        lang,
        args: { venueName, date, time },
      }),
      callout,
      footer: this.i18n.t('email.reservation_rejected_footer', { lang }),
    });

    await this.send({
      to: email,
      subject: this.i18n.t('email.reservation_rejected_subject', { lang }),
      html,
      errorContext: 'reservation rejected',
    });
  }

  async sendManagerPendingReminderEmail(
    email: string,
    firstName: string | null,
    count: number,
    lang: string = 'sr',
  ): Promise<void> {
    const dashboardUrl = `${this.firstFrontendUrl()}/dashboard/reservations`;

    const html = this.renderEmail({
      greeting: this.i18n.t('email.greeting', {
        lang,
        args: { firstName: firstName ?? '' },
      }),
      body: this.i18n.t('email.manager_pending_reminder_body', {
        lang,
        args: { count },
      }),
      buttons: [
        {
          href: dashboardUrl,
          label: this.i18n.t('email.manager_pending_reminder_button', { lang }),
        },
      ],
      footer: this.i18n.t('email.manager_pending_reminder_footer', { lang }),
    });

    await this.send({
      to: email,
      subject: this.i18n.t('email.manager_pending_reminder_subject', { lang }),
      html,
      errorContext: 'manager pending reminder',
    });
  }

  async sendContactEmail(
    toEmails: string[],
    payload: {
      fullName: string;
      email: string;
      phone?: string;
      message: string;
    },
    lang: string = 'sr',
  ): Promise<void> {
    if (toEmails.length === 0) return;

    const fromLabel = this.i18n.t('email.contact_from', { lang });
    const emailLabel = this.i18n.t('email.contact_email', { lang });
    const phoneLabel = this.i18n.t('email.contact_phone', { lang });
    const messageLabel = this.i18n.t('email.contact_message', { lang });

    const detailsHtml = `
      <div style="background:${COLORS.cream};border-radius:12px;padding:16px 18px;margin:16px 0 8px;">
        <p style="margin:6px 0;font-size:14px;color:${COLORS.text};"><strong>${fromLabel}:</strong> ${escapeHtml(payload.fullName)}</p>
        <p style="margin:6px 0;font-size:14px;color:${COLORS.text};"><strong>${emailLabel}:</strong> <a href="mailto:${escapeHtml(payload.email)}" style="color:${COLORS.orange};text-decoration:none;">${escapeHtml(payload.email)}</a></p>
        ${payload.phone ? `<p style="margin:6px 0;font-size:14px;color:${COLORS.text};"><strong>${phoneLabel}:</strong> ${escapeHtml(payload.phone)}</p>` : ''}
      </div>
      <p style="margin:18px 0 8px;font-size:12px;color:${COLORS.textSubtle};text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">${messageLabel}</p>
      <div style="background:${COLORS.card};border:1px solid ${COLORS.divider};border-radius:12px;padding:14px 16px;white-space:pre-wrap;font-size:15px;line-height:1.55;color:${COLORS.text};">${escapeHtml(payload.message)}</div>
    `;

    const html = this.renderEmail({
      body: this.i18n.t('email.contact_intro', { lang }),
      extraHtml: detailsHtml,
      footer: this.i18n.t('email.contact_footer', { lang }),
    });

    await this.send({
      to: toEmails,
      replyTo: payload.email,
      subject: this.i18n.t('email.contact_subject', {
        lang,
        args: { fullName: payload.fullName },
      }),
      html,
      errorContext: 'contact',
    });
  }

  async sendBlacklistAppealApprovedEmail(
    email: string,
    firstName: string,
    lang: string = 'sr',
  ): Promise<void> {
    const html = this.renderEmail({
      greeting: this.i18n.t('email.greeting', { lang, args: { firstName } }),
      body: this.i18n.t('email.blacklist_approved_body', { lang }),
      footer: this.i18n.t('email.blacklist_approved_footer', { lang }),
    });

    await this.send({
      to: email,
      subject: this.i18n.t('email.blacklist_approved_subject', { lang }),
      html,
      errorContext: 'blacklist-appeal approved',
    });
  }

  async sendBlacklistAppealRejectedEmail(
    email: string,
    firstName: string,
    adminNote: string | null,
    lang: string = 'sr',
  ): Promise<void> {
    const callout = adminNote
      ? {
          label: this.i18n.t('email.blacklist_rejected_reason_label', { lang }),
          content: escapeHtml(adminNote),
        }
      : undefined;

    const html = this.renderEmail({
      greeting: this.i18n.t('email.greeting', { lang, args: { firstName } }),
      body: this.i18n.t('email.blacklist_rejected_body', { lang }),
      callout,
      footer: this.i18n.t('email.blacklist_rejected_footer', { lang }),
    });

    await this.send({
      to: email,
      subject: this.i18n.t('email.blacklist_rejected_subject', { lang }),
      html,
      errorContext: 'blacklist-appeal rejected',
    });
  }
}
