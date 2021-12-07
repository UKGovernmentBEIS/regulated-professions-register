import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'industries' })
export class Industry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  constructor(name?: string) {
    this.name = name || '';
  }
}
