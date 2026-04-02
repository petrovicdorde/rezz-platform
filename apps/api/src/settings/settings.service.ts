import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async findAll(
    type?: SettingType,
    onlyActive = false,
  ): Promise<Setting[]> {
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
      throw new NotFoundException(
        await this.i18n.t('settings.not_found', { lang }),
      );
    }

    return setting;
  }

  async create(
    dto: CreateSettingDto,
    lang: string = 'sr',
  ): Promise<Setting> {
    const duplicate = await this.settingRepo
      .createQueryBuilder('setting')
      .where('setting.type = :type', { type: dto.type })
      .andWhere('LOWER(setting.value) = LOWER(:value)', {
        value: dto.value.trim(),
      })
      .getOne();

    if (duplicate) {
      throw new ConflictException(
        await this.i18n.t('settings.already_exists', { lang }),
      );
    }

    const setting = this.settingRepo.create({
      type: dto.type,
      value: dto.value.trim(),
      label: dto.label.trim(),
      isActive: dto.isActive ?? true,
      order: dto.order ?? 0,
    });

    return this.settingRepo.save(setting);
  }

  async update(
    id: string,
    dto: UpdateSettingDto,
    lang: string = 'sr',
  ): Promise<Setting> {
    const setting = await this.findOne(id, lang);

    if (dto.value !== undefined) {
      const duplicate = await this.settingRepo
        .createQueryBuilder('setting')
        .where('setting.type = :type', { type: setting.type })
        .andWhere('LOWER(setting.value) = LOWER(:value)', {
          value: dto.value.trim(),
        })
        .andWhere('setting.id != :id', { id })
        .getOne();

      if (duplicate) {
        throw new ConflictException(
          await this.i18n.t('settings.already_exists', { lang }),
        );
      }

      setting.value = dto.value.trim();
    }

    if (dto.label !== undefined) setting.label = dto.label.trim();
    if (dto.isActive !== undefined) setting.isActive = dto.isActive;
    if (dto.order !== undefined) setting.order = dto.order;

    return this.settingRepo.save(setting);
  }

  async remove(
    id: string,
    lang: string = 'sr',
  ): Promise<{ message: string }> {
    await this.findOne(id, lang);
    await this.settingRepo.delete(id);
    return { message: await this.i18n.t('settings.deleted', { lang }) };
  }

  async getPublicByType(
    type: SettingType,
  ): Promise<{ value: string; label: string }[]> {
    const settings = await this.settingRepo.find({
      where: { type, isActive: true },
      order: { order: 'ASC', label: 'ASC' },
    });

    return settings.map((s) => ({ value: s.value, label: s.label }));
  }
}
