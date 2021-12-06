import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'legislations' })
export class Legislation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  url: string;

  constructor(name?: string, url?: string) {
    this.name = name || '';
    this.url = url || '';
  }
}
