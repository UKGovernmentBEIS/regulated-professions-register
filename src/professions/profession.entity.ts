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

  @Column()
  occupationLocation: string;

  @Column()
  regulationType: string;

  @ManyToOne(() => Industry, {
    eager: true,
  })
  industry: Industry;

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

  constructor(
    name?: string,
    alternateName?: string,
    slug?: string,
    description?: string,
    occupationLocation?: string,
    regulationType?: string,
    industry?: Industry,
    qualification?: Qualification,
    reservedActivities?: string[],
    legislations?: Legislation[],
  ) {
    this.name = name || '';
    this.alternateName = alternateName || '';
    this.slug = slug || '';
    this.description = description || '';
    this.occupationLocation = occupationLocation || '';
    this.regulationType = regulationType || '';
    this.industry = industry || new Industry();
    this.qualification = qualification || new Qualification();
    this.reservedActivities = reservedActivities || [];
    this.legislations = legislations;
  }
}
