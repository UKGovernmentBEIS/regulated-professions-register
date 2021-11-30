import { Profession } from '../profession/profession.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity({ name: 'organisations' })
export class Organisation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  alternateName: string;

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

  @ManyToMany(() => Profession)
  @JoinTable()
  professions: Profession[];

  constructor(
    name?: string,
    alternateName?: string,
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
    this.address = address || '';
    this.url = url || '';
    this.email = email || '';
    this.contactUrl = contactUrl || '';
    this.telephone = telephone || '';
    this.fax = fax;
    this.professions = professions;
  }
}
