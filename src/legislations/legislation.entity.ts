import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { ProfessionVersion } from '../professions/profession-version.entity';

@Entity({ name: 'legislations' })
export class Legislation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  url: string;

  @ManyToOne(
    () => ProfessionVersion,
    (professionVersion) => professionVersion.legislations,
  )
  professionVersion: ProfessionVersion;

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

  constructor(name?: string, url?: string) {
    this.name = name || '';
    this.url = url || '';
  }
}
