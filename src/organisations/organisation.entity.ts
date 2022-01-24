import { Profession } from '../professions/profession.entity';
import { OrganisationVersion } from './organisation-version.entity';

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
  OneToOne,
} from 'typeorm';

@Entity({ name: 'organisations' })
export class Organisation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  alternateName: string;

  @Index({ unique: true, where: '"slug" IS NOT NULL' })
  @Column({ nullable: true })
  slug: string;

  @Column()
  address: string;

  @Column()
  url: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  contactUrl: string;

  @Column()
  telephone: string;

  @Column({ nullable: true })
  fax: string;

  @OneToMany(() => Profession, (profession) => profession.organisation)
  professions: Profession[];

  @OneToOne(
    () => OrganisationVersion,
    (organisationVersion) => organisationVersion.organisation,
  )
  version: OrganisationVersion;

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
    address?: string,
    url?: string,
    email?: string,
    contactUrl?: string,
    telephone?: string,
    fax?: string,
    professions?: Profession[],
  ) {
    this.name = name || '';
    this.alternateName = alternateName || '';
    this.slug = slug || '';
    this.address = address || '';
    this.url = url || '';
    this.email = email || '';
    this.contactUrl = contactUrl || '';
    this.telephone = telephone || '';
    this.fax = fax;
    this.professions = professions;
  }
}
