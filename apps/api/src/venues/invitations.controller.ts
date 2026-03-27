import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { I18nLang } from 'nestjs-i18n';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { InvitationsService } from './invitations.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { SetPasswordDto } from './dto/set-password.dto';

@Controller()
export class InvitationsController {
  constructor(
    private readonly invitationsService: InvitationsService,
  ) {}

  @Post('venues/:venueId/invitations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  sendInvitation(
    @Param('venueId') venueId: string,
    @Body() dto: CreateInvitationDto,
    @I18nLang() lang: string,
  ): Promise<{ message: string }> {
    return this.invitationsService.sendInvitation(venueId, dto, lang);
  }

  @Get('venues/invitations/:token/accept')
  async acceptInvitation(
    @Param('token') token: string,
    @Res() res: Response,
    @I18nLang() lang: string,
  ): Promise<void> {
    await this.invitationsService.acceptInvitation(token, res, lang);
  }

  @Get('venues/invitations/:token/decline')
  async declineInvitation(
    @Param('token') token: string,
    @Res() res: Response,
    @I18nLang() lang: string,
  ): Promise<void> {
    await this.invitationsService.declineInvitation(token, res, lang);
  }

  @Post('auth/set-password')
  @HttpCode(HttpStatus.OK)
  setPasswordFromInvitation(
    @Body() dto: SetPasswordDto,
    @I18nLang() lang: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
      isEmailVerified: boolean;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
    };
    message: string;
  }> {
    return this.invitationsService.setPasswordFromInvitation(
      dto.token,
      dto.password,
      lang,
    );
  }
}
