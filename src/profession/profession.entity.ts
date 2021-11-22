import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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
}
