import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  name: string;

  @Column({ unique: true })
  externalIdentifier: string;

  constructor(email?: string, name?: string, externalIdentifier?: string) {
    this.email = email || '';
    this.name = name || '';
    this.externalIdentifier = externalIdentifier || '';
  }
}
