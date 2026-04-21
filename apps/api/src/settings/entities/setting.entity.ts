import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import type { SettingType } from '@rezz/shared';

@Entity('settings')
@Unique('UQ_settings_type_value', ['type', 'value'])
export class Setting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  type: SettingType;

  @Column()
  value: string;

  @Column()
  label: string;

  @Column({ default: '' })
  labelEn: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  order: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
