import { Legislation } from '../legislation/legislation.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';

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

  @Column()
  qualificationLevel: string;

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
    qualificationLevel?: string,
    reservedActivities?: string[],
    legislations?: Legislation[],
  ) {
    this.name = name || '';
    this.alternateName = alternateName || '';
    this.description = description || '';
    this.occupationLocation = occupationLocation || '';
    this.regulationType = regulationType || '';
    this.qualificationLevel = qualificationLevel || '';
    this.reservedActivities = reservedActivities || [];
    this.legislations = legislations;
  }
}
