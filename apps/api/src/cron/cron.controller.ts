import { Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { CronAuthGuard } from './cron-auth.guard';
import { CronService, ReminderRunSummary } from './cron.service';

@Controller('cron')
export class CronController {
  constructor(private readonly cronService: CronService) {}

  @Post('reservation-reminders')
  @HttpCode(HttpStatus.OK)
  @UseGuards(CronAuthGuard)
  async runReservationReminders(): Promise<ReminderRunSummary> {
    return this.cronService.sendPendingReservationReminders();
  }
}
