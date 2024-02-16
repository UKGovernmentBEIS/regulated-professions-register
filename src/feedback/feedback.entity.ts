import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'feedback' })
export class Feedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  feedbackOrTechnical: string;

  @Column({ nullable: true })
  satisfaction: string;

  @Column({ type: 'text', nullable: true })
  improvements: string;

  @Column({ nullable: true })
  visitReason: string;

  @Column({ type: 'text', nullable: true })
  visitReasonOther: string;

  @Column({ nullable: true })
  contactAuthority: string;

  @Column({ type: 'text', nullable: true })
  contactAuthorityNoReason: string;

  @Column({ nullable: true })
  problemArea: string;

  @Column({ type: 'text', nullable: true })
  problemAreaPage: string;

  @Column({ type: 'text', nullable: true })
  problemDescription: string;

  @Column({ nullable: true })
  betaSurveyYesNo: string;

  @Column({ type: 'text', nullable: true })
  betaSurveyEmail: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;
}
