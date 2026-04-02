import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';

@Entity('landing_config')
export class LandingConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'simple-array', default: '' })
  featuredVenueIds: string[];

  @Column({ type: 'simple-array', default: '' })
  featuredEventIds: string[];

  @Column({ default: true })
  showFeaturedVenues: boolean;

  @Column({ default: false })
  showFeaturedEvents: boolean;

  @UpdateDateColumn()
  updatedAt: Date;
}
