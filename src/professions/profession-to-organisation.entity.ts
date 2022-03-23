import { Entity, ManyToOne, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Organisation } from '../organisations/organisation.entity';
import { Profession } from './profession.entity';

export enum OrganisationRole {
  PrimaryRegulator = 'primaryRegulator',
  CharteredBody = 'charteredBody',
  QualifyingBody = 'qualifyingBody',
  AdditionalRegulator = 'additionalRegulator',
  OversightBody = 'oversightBody',
  EnforcementBody = 'enforcementBody',
  AwardingBody = 'awardingBody',
}

@Entity({ name: 'professionToOrganisation' })
export class ProfessionToOrganisation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(
    () => Organisation,
    (organisation) => organisation.professionToOrganisations,
  )
  organisation!: Organisation;

  @ManyToOne(
    () => Profession,
    (profession) => profession.professionToOrganisations,
  )
  profession!: Profession;

  @Column({ type: 'enum', nullable: true, enum: OrganisationRole })
  role: OrganisationRole;

  constructor(
    organisation: Organisation,
    profession: Profession,
    role: OrganisationRole,
  ) {
    this.organisation = organisation || null;
    this.profession = profession || null;
    this.role = role || null;
  }
}
