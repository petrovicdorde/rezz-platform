import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly resend: Resend;
  private readonly frontendUrl: string;
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly configService: ConfigService) {
    this.resend = new Resend(this.configService.get<string>('RESEND_API_KEY'));
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173');
  }

  async sendVerificationEmail(
    email: string,
    firstName: string,
    token: string,
  ): Promise<void> {
    const verificationLink = `${this.frontendUrl}/auth/verify-email?token=${token}`;

    try {
      await this.resend.emails.send({
        from: 'Rezz <onboarding@resend.dev>',
        to: email,
        subject: 'Verify your email',
        html: `
          <h1>Welcome, ${firstName}!</h1>
          <p>Please verify your email address by clicking the link below:</p>
          <a href="${verificationLink}">Verify Email</a>
          <p>This link will expire in 24 hours.</p>
        `,
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
    const resetLink = `${this.frontendUrl}/auth/reset-password?token=${token}`;

    try {
      await this.resend.emails.send({
        from: 'Rezz <onboarding@resend.dev>',
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
      this.logger.error(`Failed to send password reset email to ${email}`, error);
    }
  }
}
