import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import { Organisation } from '../organisations/organisation.entity';
import { Profession } from '../professions/profession.entity';
import { User } from '../users/user.entity';
import { DecisionRoute } from './interfaces/decision-route.interface';

export enum DecisionStatus {
  Unconfirmed = 'unconfirmed',
  Draft = 'draft',
  Live = 'live',
}

@Entity({ name: 'decision-datasets' })
export class DecisionDataset {
  @ManyToOne(() => Profession, { primary: true })
  profession: Profession;

  @ManyToOne(() => Organisation, { primary: true })
  organisation: Organisation;

  @Column({ type: 'int', primary: true })
  year: number;

  @Column({
    type: 'enum',
    enum: DecisionStatus,
    default: DecisionStatus.Unconfirmed,
  })
  status: DecisionStatus;

  @Column({ type: 'json' })
  routes: DecisionRoute[];

  @ManyToOne(() => User, { nullable: true })
  user: User;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updated_at: Date;
}
