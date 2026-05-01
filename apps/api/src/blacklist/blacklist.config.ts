import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class BlacklistConfig {
  readonly noShowThreshold: number;
  readonly noShowWindowDays: number;
  readonly blockDays: number;

  constructor(private readonly configService: ConfigService) {
    this.noShowThreshold = this.readPositiveInt(
      'BLACKLIST_NO_SHOW_THRESHOLD',
      3,
    );
    this.noShowWindowDays = this.readPositiveInt(
      'BLACKLIST_NO_SHOW_WINDOW_DAYS',
      30,
    );
    this.blockDays = this.readPositiveInt('BLACKLIST_BLOCK_DAYS', 1);
  }

  get noShowWindowMs(): number {
    return this.noShowWindowDays * DAY_MS;
  }

  get blockMs(): number {
    return this.blockDays * DAY_MS;
  }

  expiresAt(blacklistedAt: Date | null | undefined): Date | null {
    if (!blacklistedAt) return null;
    return new Date(blacklistedAt.getTime() + this.blockMs);
  }

  isExpired(
    blacklistedAt: Date | null | undefined,
    now: Date = new Date(),
  ): boolean {
    if (!blacklistedAt) return false;
    return now.getTime() - blacklistedAt.getTime() > this.blockMs;
  }

  private readPositiveInt(key: string, fallback: number): number {
    const raw = this.configService.get<string>(key);
    if (raw === undefined || raw === null || raw === '') return fallback;
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
    return parsed;
  }
}
