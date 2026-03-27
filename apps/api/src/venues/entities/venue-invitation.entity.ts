import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import type { UserRole, InvitationStatus } from '@rezz/shared';
import { Venue } from './venue.entity';

@Entity('venue_invitations')
export class VenueInvitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', nullable: true })
  firstName: string | null;

  @Column({ type: 'varchar', nullable: true })
  lastName: string | null;

  @Column({ type: 'enum', enum: ['MANAGER', 'WORKER'] })
  role: Extract<UserRole, 'MANAGER' | 'WORKER'>;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED'],
    default: 'PENDING',
  })
  status: InvitationStatus;

  @Column({ unique: true })
  token: string;

  @Column({ type: 'timestamptz' })
  tokenExpiresAt: Date;

  @ManyToOne(() => Venue, (venue) => venue.invitations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'venue_id' })
  venue: Venue;

  @Column()
  venueId: string;

  @Column({ type: 'timestamptz', nullable: true })
  acceptedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  declinedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
