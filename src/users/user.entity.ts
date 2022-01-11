import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

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

  @Index({ unique: true, where: '"externalIdentifier" IS NOT NULL' })
  @Column({ nullable: true })
  externalIdentifier: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    array: true,
    default: [],
  })
  roles: UserRole[];

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

  @Column({ default: false })
  serviceOwner: boolean;

  @Column({ default: false })
  confirmed: boolean;

  constructor(
    email?: string,
    name?: string,
    externalIdentifier?: string,
    roles?: UserRole[],
    serviceOwner?: boolean,
    confirmed?: boolean,
  ) {
    this.email = email || '';
    this.name = name || '';
    this.externalIdentifier = externalIdentifier || null;
    this.roles = roles || [];
    this.serviceOwner = serviceOwner || false;
    this.confirmed = confirmed || false;
  }
}
