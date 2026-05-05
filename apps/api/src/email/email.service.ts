import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { Resend } from 'resend';

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

  async sendVerificationEmail(
    email: string,
    firstName: string,
    token: string,
    lang: string = 'sr',
  ): Promise<void> {
    const backendUrl = this.configService.get<string>(
      'BACKEND_URL',
      'http://localhost:3000',
    );
    const verificationLink = `${backendUrl}/auth/verify-email?token=${token}`;

    const subject = this.i18n.t('email.verification_subject', { lang });
    const greeting = this.i18n.t('email.greeting', {
      lang,
      args: { firstName },
    });
    const body = this.i18n.t('email.verification_body', { lang });
    const button = this.i18n.t('email.verification_button', { lang });
    const footer = this.i18n.t('email.verification_footer', { lang });

    const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
      <h2 style="color:#3D2645;">Table.ba</h2>
      <p>${greeting}</p>
      <p>${body}</p>
      <a href="${verificationLink}"
         style="display:inline-block;background:#C9A84C;color:#3A2A08;
                padding:12px 24px;border-radius:8px;text-decoration:none;
                font-weight:bold;margin:16px 0;">
        ${button}
      </a>
      <p style="color:#9A8C7C;font-size:13px;">${footer}</p>
    </body>
    </html>
    `;

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject,
        html,
      });
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}`, error);
    }
  }

  async sendPasswordResetEmail(
    email: string,
    firstName: string,
    token: string,
  ): Promise<void> {
    const frontendUrl = (
      this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173') ??
      'http://localhost:5173'
    )
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)[0];
    const resetLink = `${frontendUrl}/auth/reset-password?token=${token}`;

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Reset your password',
        html: `
          <h1>Hi, ${firstName}!</h1>
          <p>You requested a password reset. Click the link below to set a new password:</p>
          <a href="${resetLink}">Reset Password</a>
          <p>This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
        `,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${email}`,
        error,
      );
    }
  }

  async sendManagerInvitationEmail(
    email: string,
    venueName: string,
    token: string,
    lang: string = 'sr',
  ): Promise<void> {
    const backendUrl = this.configService.get<string>(
      'BACKEND_URL',
      'http://localhost:3000',
    );
    const acceptLink = `${backendUrl}/venues/invitations/${token}/accept`;
    const declineLink = `${backendUrl}/venues/invitations/${token}/decline`;

    const subject = this.i18n.t('email.manager_invitation_subject', {
      lang,
      args: { venueName },
    });
    const body = this.i18n.t('email.manager_invitation_body', {
      lang,
      args: { venueName },
    });
    const acceptButton = this.i18n.t('email.manager_invitation_button', {
      lang,
    });
    const declineButton = this.i18n.t(
      'email.manager_invitation_decline_button',
      { lang },
    );
    const footer = this.i18n.t('email.manager_invitation_footer', { lang });

    const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
      <h2 style="color:#3D2645;">Table.ba</h2>
      <p>${body}</p>
      <a href="${acceptLink}"
         style="display:inline-block;background:#C9A84C;color:#3A2A08;
                padding:12px 24px;border-radius:8px;text-decoration:none;
                font-weight:bold;margin:16px 8px 0 0;">
        ${acceptButton}
      </a>
      <a href="${declineLink}"
         style="display:inline-block;background:#E8DFD0;color:#5E5248;
                padding:12px 24px;border-radius:8px;text-decoration:none;
                font-weight:bold;margin:16px 0 0 0;">
        ${declineButton}
      </a>
      <p style="color:#9A8C7C;font-size:13px;margin-top:24px;">${footer}</p>
    </body>
    </html>
    `;

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject,
        html,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send manager invitation email to ${email}`,
        error,
      );
    }
  }

  async sendReservationCancelledEmail(
    email: string,
    venueName: string,
    date: string,
    time: string,
    reason: string,
    lang: string = 'sr',
  ): Promise<void> {
    const subject = this.i18n.t('email.reservation_cancelled_subject', {
      lang,
    });
    const body = this.i18n.t('email.reservation_cancelled_body', {
      lang,
      args: { venueName, date, time },
    });
    const reasonText = this.i18n.t('email.reservation_cancelled_reason', {
      lang,
      args: { reason },
    });
    const footer = this.i18n.t('email.reservation_cancelled_footer', { lang });

    const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
      <h2 style="color:#3D2645;">Table.ba</h2>
      <p>${body}</p>
      <p style="background:#FEF3C7;border-left:4px solid #F59E0B;padding:12px;border-radius:4px;margin:16px 0;">
        ${reasonText}
      </p>
      <p style="color:#9A8C7C;font-size:13px;">${footer}</p>
    </body>
    </html>
    `;

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject,
        html,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send reservation cancelled email to ${email}`,
        error,
      );
    }
  }

  async sendReservationConfirmedEmail(
    email: string,
    venueName: string,
    date: string,
    time: string,
    lang: string = 'sr',
  ): Promise<void> {
    const subject = this.i18n.t('email.reservation_confirmed_subject', {
      lang,
    });
    const body = this.i18n.t('email.reservation_confirmed_body', {
      lang,
      args: { venueName, date, time },
    });
    const footer = this.i18n.t('email.reservation_confirmed_footer', { lang });

    const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
      <h2 style="color:#3D2645;">Table.ba</h2>
      <p>${body}</p>
      <p style="color:#9A8C7C;font-size:13px;">${footer}</p>
    </body>
    </html>
    `;

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject,
        html,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send reservation confirmed email to ${email}`,
        error,
      );
    }
  }

  async sendReservationRejectedEmail(
    email: string,
    venueName: string,
    date: string,
    time: string,
    reason: string | null,
    lang: string = 'sr',
  ): Promise<void> {
    const subject = this.i18n.t('email.reservation_rejected_subject', {
      lang,
    });
    const body = this.i18n.t('email.reservation_rejected_body', {
      lang,
      args: { venueName, date, time },
    });
    const footer = this.i18n.t('email.reservation_rejected_footer', { lang });
    const reasonText = reason
      ? this.i18n.t('email.reservation_rejected_reason', {
          lang,
          args: { reason },
        })
      : null;

    const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
      <h2 style="color:#3D2645;">Table.ba</h2>
      <p>${body}</p>
      ${
        reasonText
          ? `<p style="background:#FEF3C7;border-left:4px solid #F59E0B;padding:12px;border-radius:4px;margin:16px 0;">${reasonText}</p>`
          : ''
      }
      <p style="color:#9A8C7C;font-size:13px;">${footer}</p>
    </body>
    </html>
    `;

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject,
        html,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send reservation rejected email to ${email}`,
        error,
      );
    }
  }

  async sendManagerPendingReminderEmail(
    email: string,
    firstName: string | null,
    count: number,
    lang: string = 'sr',
  ): Promise<void> {
    const frontendUrl = (
      this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173') ??
      'http://localhost:5173'
    )
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)[0];
    const dashboardUrl = `${frontendUrl}/dashboard/reservations`;

    const subject = this.i18n.t('email.manager_pending_reminder_subject', {
      lang,
    });
    const greeting = this.i18n.t('email.greeting', {
      lang,
      args: { firstName: firstName ?? '' },
    });
    const body = this.i18n.t('email.manager_pending_reminder_body', {
      lang,
      args: { count },
    });
    const button = this.i18n.t('email.manager_pending_reminder_button', {
      lang,
    });
    const footer = this.i18n.t('email.manager_pending_reminder_footer', {
      lang,
    });

    const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
      <h2 style="color:#3D2645;">Table.ba</h2>
      <p>${greeting}</p>
      <p>${body}</p>
      <a href="${dashboardUrl}"
         style="display:inline-block;background:#C9A84C;color:#3A2A08;
                padding:12px 24px;border-radius:8px;text-decoration:none;
                font-weight:bold;margin:16px 0;">
        ${button}
      </a>
      <p style="color:#9A8C7C;font-size:13px;">${footer}</p>
    </body>
    </html>
    `;

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject,
        html,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send manager pending reminder email to ${email}`,
        error,
      );
    }
  }

  async sendWorkerInvitationEmail(
    email: string,
    venueName: string,
    token: string,
    lang: string = 'sr',
  ): Promise<void> {
    const backendUrl = this.configService.get<string>(
      'BACKEND_URL',
      'http://localhost:3000',
    );
    const acceptLink = `${backendUrl}/venues/invitations/${token}/accept`;

    const subject = this.i18n.t('email.worker_invitation_subject', {
      lang,
      args: { venueName },
    });
    const body = this.i18n.t('email.worker_invitation_body', {
      lang,
      args: { venueName },
    });
    const acceptButton = this.i18n.t('email.worker_invitation_button', {
      lang,
    });
    const footer = this.i18n.t('email.worker_invitation_footer', { lang });

    const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
      <h2 style="color:#3D2645;">Table.ba</h2>
      <p>${body}</p>
      <a href="${acceptLink}"
         style="display:inline-block;background:#C9A84C;color:#3A2A08;
                padding:12px 24px;border-radius:8px;text-decoration:none;
                font-weight:bold;margin:16px 8px 0 0;">
        ${acceptButton}
      </a>
      <p style="color:#9A8C7C;font-size:13px;margin-top:24px;">${footer}</p>
    </body>
    </html>
    `;

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject,
        html,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send worker invitation email to ${email}`,
        error,
      );
    }
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

    const subject = this.i18n.t('email.contact_subject', {
      lang,
      args: { fullName: payload.fullName },
    });
    const intro = this.i18n.t('email.contact_intro', { lang });
    const fromLabel = this.i18n.t('email.contact_from', { lang });
    const emailLabel = this.i18n.t('email.contact_email', { lang });
    const phoneLabel = this.i18n.t('email.contact_phone', { lang });
    const messageLabel = this.i18n.t('email.contact_message', { lang });
    const footer = this.i18n.t('email.contact_footer', { lang });

    const safe = (s: string): string =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const phoneRow = payload.phone
      ? `<p style="margin:6px 0;"><strong>${phoneLabel}:</strong> ${safe(payload.phone)}</p>`
      : '';

    const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#140B00;">
      <h2 style="color:#F98513;margin:0 0 16px;">Table.ba — Contact</h2>
      <p>${intro}</p>
      <div style="background:#F5F1EB;border-radius:12px;padding:16px;margin:16px 0;">
        <p style="margin:6px 0;"><strong>${fromLabel}:</strong> ${safe(payload.fullName)}</p>
        <p style="margin:6px 0;"><strong>${emailLabel}:</strong> <a href="mailto:${safe(payload.email)}">${safe(payload.email)}</a></p>
        ${phoneRow}
      </div>
      <p style="margin:6px 0;"><strong>${messageLabel}:</strong></p>
      <p style="white-space:pre-wrap;background:#FFFFFF;border:1px solid rgba(20,11,0,0.08);border-radius:12px;padding:14px;">${safe(payload.message)}</p>
      <p style="color:rgba(20,11,0,0.55);font-size:13px;margin-top:24px;">${footer}</p>
    </body>
    </html>
    `;

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: toEmails,
        replyTo: payload.email,
        subject,
        html,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send contact email to ${toEmails.join(', ')}`,
        error,
      );
    }
  }

  async sendBlacklistAppealApprovedEmail(
    email: string,
    firstName: string,
    lang: string = 'sr',
  ): Promise<void> {
    const subject = this.i18n.t('email.blacklist_approved_subject', { lang });
    const greeting = this.i18n.t('email.greeting', {
      lang,
      args: { firstName },
    });
    const body = this.i18n.t('email.blacklist_approved_body', { lang });
    const footer = this.i18n.t('email.blacklist_approved_footer', { lang });

    const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#140B00;">
      <h2 style="color:#F98513;margin:0 0 16px;">Table.ba</h2>
      <p>${greeting}</p>
      <p>${body}</p>
      <p style="color:rgba(20,11,0,0.55);font-size:13px;margin-top:24px;">${footer}</p>
    </body>
    </html>
    `;

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject,
        html,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send blacklist-appeal approved email to ${email}`,
        error,
      );
    }
  }

  async sendBlacklistAppealRejectedEmail(
    email: string,
    firstName: string,
    adminNote: string | null,
    lang: string = 'sr',
  ): Promise<void> {
    const subject = this.i18n.t('email.blacklist_rejected_subject', { lang });
    const greeting = this.i18n.t('email.greeting', {
      lang,
      args: { firstName },
    });
    const body = this.i18n.t('email.blacklist_rejected_body', { lang });
    const reasonLabel = this.i18n.t('email.blacklist_rejected_reason_label', {
      lang,
    });
    const footer = this.i18n.t('email.blacklist_rejected_footer', { lang });

    const safe = (s: string): string =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const reasonBlock = adminNote
      ? `<div style="background:#F5F1EB;border-left:4px solid #F98513;padding:12px 14px;border-radius:8px;margin:16px 0;">
           <p style="margin:0 0 6px;font-size:12px;color:rgba(20,11,0,0.55);text-transform:uppercase;letter-spacing:1.5px;">${reasonLabel}</p>
           <p style="margin:0;white-space:pre-wrap;">${safe(adminNote)}</p>
         </div>`
      : '';

    const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#140B00;">
      <h2 style="color:#F98513;margin:0 0 16px;">Table.ba</h2>
      <p>${greeting}</p>
      <p>${body}</p>
      ${reasonBlock}
      <p style="color:rgba(20,11,0,0.55);font-size:13px;margin-top:24px;">${footer}</p>
    </body>
    </html>
    `;

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject,
        html,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send blacklist-appeal rejected email to ${email}`,
        error,
      );
    }
  }
}
