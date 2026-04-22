import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import type { VenueType, PaymentMethod, SocialLink } from '@rezz/shared';
import { VenueTable } from './venue-table.entity';
import { VenueInvitation } from './venue-invitation.entity';

@Entity('venues')
export class Venue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'varchar' })
  type: VenueType;

  @Column()
  reservationPhone: string;

  @Column({ type: 'varchar', nullable: true })
  reservationEmail: string | null;

  @Column({ type: 'jsonb', default: {} })
  workingHours: WorkingHours;

  @Column({ type: 'simple-array', default: '' })
  paymentMethods: PaymentMethod[];

  @Column({ default: false })
  hasParking: boolean;

  @Column({ type: 'simple-array', default: '' })
  tags: string[];

  @Column({ default: true })
  isActive: boolean;

  @Column()
  city: string;

  @Column()
  address: string;

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'jsonb', default: '[]' })
  socialLinks: SocialLink[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => VenueTable, (table) => table.venue, { cascade: true })
  tables: VenueTable[];

  @OneToMany(() => VenueInvitation, (invitation) => invitation.venue, {
    cascade: true,
  })
  invitations: VenueInvitation[];
}

export interface WorkingHours {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
}

export interface DayHours {
  open: string; // e.g. "08:00"
  close: string; // e.g. "23:00"
  isClosed: boolean;
}
