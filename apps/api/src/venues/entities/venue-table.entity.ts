import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import type { TableType } from '@rezz/shared';
import { Venue } from './venue.entity';

@Entity('venue_tables')
export class VenueTable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  type: TableType;

  @Column()
  count: number;

  @Column({ type: 'varchar', nullable: true })
  note: string | null;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Venue, (venue) => venue.tables, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'venue_id' })
  venue: Venue;

  @Column({ name: 'venue_id', type: 'uuid' })
  venueId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
