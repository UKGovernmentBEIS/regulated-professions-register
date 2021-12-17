import { Legislation } from '../legislations/legislation.entity';
import { Qualification } from '../qualifications/qualification.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  ManyToOne,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Industry } from '../industries/industry.entity';

@Entity({ name: 'professions' })
export class Profession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  alternateName: string;

  @Index()
  @Column({ unique: true })
  slug: string;

  @Column()
  description: string;

  @Column('text', { array: true, nullable: true })
  occupationLocations: string[];

  @Column()
  regulationType: string;

  @ManyToMany(() => Industry, { nullable: true, eager: true })
  @JoinTable()
  industries: Industry[];

  @ManyToOne(() => Qualification, {
    eager: true,
  })
  qualification: Qualification;

  @Column('text', { array: true })
  reservedActivities: string[];

  @ManyToMany(() => Legislation, {
    eager: true,
  })
  @JoinTable()
  legislations: Legislation[];

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

  constructor(
    name?: string,
    alternateName?: string,
    slug?: string,
    description?: string,
    occupationLocations?: string[],
    regulationType?: string,
    industries?: Industry[],
    qualification?: Qualification,
    reservedActivities?: string[],
    legislations?: Legislation[],
  ) {
    this.name = name || '';
    this.alternateName = alternateName || '';
    this.slug = slug || '';
    this.description = description || '';
    this.occupationLocations = occupationLocations || [];
    this.regulationType = regulationType || '';
    this.industries = industries || null;
    this.qualification = qualification || null;
    this.reservedActivities = reservedActivities || [];
    this.legislations = legislations || null;
  }
}
