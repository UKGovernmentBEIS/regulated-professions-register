import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  name: string;

  @Column()
  identifier: string;

  constructor(email?: string, name?: string, identifier?: string) {
    this.email = email || '';
    this.name = name || '';
    this.identifier = identifier || '';
  }
}
