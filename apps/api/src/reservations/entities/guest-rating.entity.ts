import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Reservation } from './reservation.entity';
import { User } from '../../users/entities/user.entity';

@Entity('guest_ratings')
export class GuestRating {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  rating: number;

  @Column({ nullable: true, type: 'text' })
  note: string | null;

  @OneToOne(() => Reservation, (reservation) => reservation.guestRating, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reservation_id' })
  reservation: Reservation;

  @Column()
  reservationId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'guest_user_id' })
  guestUser: User | null;

  @Column({ type: 'uuid', nullable: true })
  guestUserId: string | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rated_by_id' })
  ratedBy: User;

  @Column()
  ratedById: string;

  @Column()
  venueId: string;

  @Column({ default: false })
  isAutomatic: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
