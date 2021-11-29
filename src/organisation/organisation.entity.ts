import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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
}
