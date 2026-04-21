import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import type { SettingType } from '@rezz/shared';
import { Setting } from './entities/setting.entity';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private readonly settingRepo: Repository<Setting>,
    private readonly i18n: I18nService,
  ) {}

  async findAll(type?: SettingType, onlyActive = false): Promise<Setting[]> {
    const qb = this.settingRepo.createQueryBuilder('setting');

    if (type) {
      qb.where('setting.type = :type', { type });
    }

    if (onlyActive) {
      qb.andWhere('setting.isActive = true');
    }

    qb.orderBy('setting.order', 'ASC').addOrderBy('setting.label', 'ASC');

    return qb.getMany();
  }

  async findOne(id: string, lang: string = 'sr'): Promise<Setting> {
    const setting = await this.settingRepo.findOne({ where: { id } });

    if (!setting) {
      throw new NotFoundException(this.i18n.t('settings.not_found', { lang }));
    }

    return setting;
  }

  private normalizeValue(value: string): string {
    return value
      .trim()
      .toUpperCase()
      .replace(/\s+/g, '_')
      .replace(/[^A-Z0-9_]/g, '');
  }

  private isUniqueViolation(error: unknown): boolean {
    return (
      error instanceof QueryFailedError &&
      (error as QueryFailedError & { code?: string }).code === '23505'
    );
  }

  async create(dto: CreateSettingDto, lang: string = 'sr'): Promise<Setting> {
    const value = this.normalizeValue(dto.value);
    const label = dto.label.trim();

    const duplicate = await this.settingRepo
      .createQueryBuilder('setting')
      .where('setting.type = :type', { type: dto.type })
      .andWhere(
        '(setting.value = :value OR LOWER(setting.label) = LOWER(:label))',
        { value, label },
      )
      .getOne();

    if (duplicate) {
      throw new ConflictException(
        this.i18n.t('settings.already_exists', { lang }),
      );
    }

    const labelEn: string = dto.labelEn ? dto.labelEn.trim() : '';

    const setting = this.settingRepo.create({
      type: dto.type,
      value,
      label,
      labelEn,
      isActive: dto.isActive ?? true,
      order: dto.order ?? 0,
    });

    try {
      return await this.settingRepo.save(setting);
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException(
          this.i18n.t('settings.already_exists', { lang }),
        );
      }
      throw error;
    }
  }

  async update(
    id: string,
    dto: UpdateSettingDto,
    lang: string = 'sr',
  ): Promise<Setting> {
    const setting = await this.findOne(id, lang);

    if (dto.value !== undefined) {
      const value = this.normalizeValue(dto.value);

      const duplicate = await this.settingRepo
        .createQueryBuilder('setting')
        .where('setting.type = :type', { type: setting.type })
        .andWhere('setting.value = :value', { value })
        .andWhere('setting.id != :id', { id })
        .getOne();

      if (duplicate) {
        throw new ConflictException(
          this.i18n.t('settings.already_exists', { lang }),
        );
      }

      setting.value = value;
    }

    if (dto.label !== undefined) {
      const label = dto.label.trim();
      const labelDuplicate = await this.settingRepo
        .createQueryBuilder('setting')
        .where('setting.type = :type', { type: setting.type })
        .andWhere('LOWER(setting.label) = LOWER(:label)', { label })
        .andWhere('setting.id != :id', { id })
        .getOne();

      if (labelDuplicate) {
        throw new ConflictException(
          this.i18n.t('settings.already_exists', { lang }),
        );
      }

      setting.label = label;
    }
    if (dto.labelEn !== undefined) {
      const trimmed: string = dto.labelEn.trim();
      setting.labelEn = trimmed;
    }
    if (dto.isActive !== undefined) setting.isActive = dto.isActive;
    if (dto.order !== undefined) setting.order = dto.order;

    try {
      return await this.settingRepo.save(setting);
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException(
          this.i18n.t('settings.already_exists', { lang }),
        );
      }
      throw error;
    }
  }

  async remove(id: string, lang: string = 'sr'): Promise<{ message: string }> {
    await this.findOne(id, lang);
    await this.settingRepo.delete(id);
    return { message: this.i18n.t('settings.deleted', { lang }) };
  }

  async getPublicByType(
    type: SettingType,
  ): Promise<{ value: string; label: string; labelEn: string }[]> {
    const settings = await this.settingRepo.find({
      where: { type, isActive: true },
      order: { order: 'ASC', label: 'ASC' },
    });

    return settings.map((s) => ({
      value: s.value,
      label: s.label,
      labelEn: s.labelEn,
    }));
  }
}
