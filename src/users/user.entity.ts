import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export enum UserRole {
  Admin = 'admin',
  Editor = 'editor',
}

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

  @Column({
    type: 'enum',
    enum: UserRole,
    array: true,
    default: [],
  })
  roles: UserRole[];

  constructor(
    email?: string,
    name?: string,
    externalIdentifier?: string,
    roles?: UserRole[],
  ) {
    this.email = email || '';
    this.name = name || '';
    this.externalIdentifier = externalIdentifier || '';
    this.roles = roles || [];
  }
}
