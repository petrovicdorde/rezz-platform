import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nLang } from 'nestjs-i18n';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import type { SafeUser } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { GoogleOAuthUser } from './strategies/google.strategy';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(
    @Body() dto: RegisterDto,
    @I18nLang() lang: string,
  ): Promise<{ message: string }> {
    return this.authService.register(dto, lang);
  }

  @Get('verify-email')
  async verifyEmail(
    @Query('token') token: string,
    @Res() res: Response,
    @I18nLang() lang: string,
  ): Promise<void> {
    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:5173',
    );
    try {
      await this.authService.verifyEmail(token, lang);
      res.redirect(`${frontendUrl}/auth/verified`);
    } catch {
      res.redirect(`${frontendUrl}/auth/verify-error`);
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string; user: SafeUser }> {
    return this.authService.login(dto);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: { user: { userId: string; refreshToken: string } },
  ): Promise<{ accessToken: string }> {
    const { userId, refreshToken } = req.user;
    return this.authService.refreshToken(userId, refreshToken);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() dto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.resetPassword(dto);
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google')
  async googleAuth(): Promise<void> {
    // Guard redirects to Google
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(
    @Req() req: { user: GoogleOAuthUser },
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.authService.googleLogin(req.user);
    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:5173',
    );
    const params = new URLSearchParams({
      token: result.accessToken,
      refreshToken: result.refreshToken,
    });
    res.redirect(`${frontendUrl}/auth/callback?${params.toString()}`);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@CurrentUser() user: User): Promise<{ message: string }> {
    return this.authService.logout(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: User): SafeUser {
    return this.authService.toSafeUser(user);
  }
}
