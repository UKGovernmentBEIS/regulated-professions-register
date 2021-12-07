import { Legislation } from '../legislations/legislation.entity';
import { Qualification } from '../qualification/qualification.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  ManyToOne,
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

  @Column()
  description: string;

  @Column()
  occupationLocation: string;

  @Column()
  regulationType: string;

  @ManyToOne(() => Industry)
  industry: Industry;

  @ManyToOne(() => Qualification)
  qualification: Qualification;

  @Column('text', { array: true })
  reservedActivities: string[];

  @ManyToMany(() => Legislation)
  @JoinTable()
  legislations: Legislation[];

  constructor(
    name?: string,
    alternateName?: string,
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
    this.description = description || '';
    this.occupationLocation = occupationLocation || '';
    this.regulationType = regulationType || '';
    this.industry = industry || new Industry();
    this.qualification = qualification || new Qualification();
    this.reservedActivities = reservedActivities || [];
    this.legislations = legislations;
  }
}
