import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'qualifications' })
export class Qualification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  routesToObtain: string;

  @Column({ nullable: true })
  url: string;

  @Column({ nullable: true })
  ukRecognition: string;

  @Column({ nullable: true })
  ukRecognitionUrl: string;

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
    routesToObtain?: string,
    url?: string,
    ukRecognition?: string,
    ukRecognitionUrl?: string,
  ) {
    this.routesToObtain = routesToObtain || '';
    this.url = url || '';
    this.ukRecognition = ukRecognition || '';
    this.ukRecognitionUrl = ukRecognitionUrl || '';
  }
}
