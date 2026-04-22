import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import type {
  ReservationStatus,
  ReservationSource,
  TableType,
} from '@rezz/shared';
import { Venue } from '../../venues/entities/venue.entity';
import { User } from '../../users/entities/user.entity';
import { Event } from '../../events/entities/event.entity';
import type { GuestRating } from './guest-rating.entity';

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Venue, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'venue_id' })
  venue: Venue;

  @Column({ name: 'venue_id', type: 'uuid' })
  venueId: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'time' })
  time: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  phone: string;

  @Column({ type: 'int' })
  numberOfGuests: number;

  @Column({ type: 'varchar' })
  tableType: TableType;

  @Column({ nullable: true, type: 'text' })
  specialRequest: string | null;

  @Column({
    type: 'enum',
    enum: [
      'PENDING',
      'CONFIRMED',
      'REJECTED',
      'CANCELLED',
      'COMPLETED',
      'NO_SHOW',
    ],
    default: 'PENDING',
  })
  status: ReservationStatus;

  @Column({
    type: 'enum',
    enum: ['GUEST_APP', 'MANAGER'],
    default: 'GUEST_APP',
  })
  source: ReservationSource;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by_manager_id' })
  createdByManager: User | null;

  @Column({ name: 'created_by_manager_id', type: 'uuid', nullable: true })
  createdByManagerId: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  @ManyToOne(() => Event, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'event_id' })
  event: Event | null;

  @Column({ name: 'event_id', type: 'uuid', nullable: true })
  eventId: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  arrivedAt: Date | null;

  @Column({ nullable: true, type: 'text' })
  arrivalNote: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  cancelledAt: Date | null;

  @Column({ nullable: true, type: 'text' })
  cancellationReason: string | null;

  @OneToOne('GuestRating', 'reservation', { nullable: true })
  guestRating: GuestRating | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
