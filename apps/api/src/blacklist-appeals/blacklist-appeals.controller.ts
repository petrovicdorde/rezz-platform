import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { I18nLang } from 'nestjs-i18n';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { BlacklistAppealsService } from './blacklist-appeals.service';
import { BlacklistAppeal } from './entities/blacklist-appeal.entity';
import { SubmitAppealDto } from './dto/submit-appeal.dto';
import { DecideAppealDto } from './dto/decide-appeal.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class BlacklistAppealsController {
  constructor(private readonly service: BlacklistAppealsService) {}

  // Guest — read your own appeal status
  @Get('profile/blacklist-appeal')
  @UseGuards(RolesGuard)
  @Roles(UserRole.GUEST)
  async getMine(@CurrentUser() user: User): Promise<BlacklistAppeal | null> {
    return this.service.findMyLatest(user.id);
  }

  // Guest — submit an appeal
  @Post('profile/blacklist-appeal')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(UserRole.GUEST)
  async submit(
    @CurrentUser() user: User,
    @Body() dto: SubmitAppealDto,
    @I18nLang() lang: string,
  ): Promise<BlacklistAppeal> {
    return this.service.submit(user.id, dto, lang);
  }

  // Super admin — list appeals
  @Get('admin/blacklist-appeals')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async list(@Query('status') status?: string): Promise<BlacklistAppeal[]> {
    const filter: BlacklistAppeal['status'][] =
      status === 'APPROVED'
        ? ['APPROVED']
        : status === 'REJECTED'
          ? ['REJECTED']
          : ['PENDING'];
    return this.service.listForAdmin(filter);
  }

  // Super admin — approve / reject
  @Patch('admin/blacklist-appeals/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async decide(
    @Param('id') id: string,
    @CurrentUser() admin: User,
    @Body() dto: DecideAppealDto,
    @I18nLang() lang: string,
  ): Promise<BlacklistAppeal> {
    return this.service.decide(id, admin.id, dto, lang);
  }
}
