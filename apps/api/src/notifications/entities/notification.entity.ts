import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import type { NotificationType } from '@rezz/shared';
import { User } from '../../users/entities/user.entity';
import { Reservation } from '../../reservations/entities/reservation.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  userId: string;

  @Column({ type: 'varchar' })
  type: NotificationType;

  @Column({ default: false })
  isRead: boolean;

  @ManyToOne(() => Reservation, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reservation_id' })
  reservation: Reservation | null;

  @Column({ type: 'uuid', nullable: true })
  reservationId: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt: Date;
}
