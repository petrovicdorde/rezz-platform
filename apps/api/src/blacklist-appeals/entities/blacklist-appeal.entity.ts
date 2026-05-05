import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export type BlacklistAppealStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

@Entity('blacklist_appeals')
export class BlacklistAppeal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'varchar', default: 'PENDING' })
  status: BlacklistAppealStatus;

  @Column({ type: 'text', nullable: true })
  adminNote: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'decided_by_admin_id' })
  decidedByAdmin: User | null;

  @Column({ name: 'decided_by_admin_id', type: 'uuid', nullable: true })
  decidedByAdminId: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  submittedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  decidedAt: Date | null;
}
