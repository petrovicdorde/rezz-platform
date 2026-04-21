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
      <h2 style="color:#3D2645;">Rezz.ba</h2>
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
    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:5173',
    );
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
      <h2 style="color:#3D2645;">Rezz.ba</h2>
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
      <h2 style="color:#3D2645;">Rezz.ba</h2>
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
      <h2 style="color:#3D2645;">Rezz.ba</h2>
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
}
