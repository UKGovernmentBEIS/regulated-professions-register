import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Seeder } from 'nestjs-seeder';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectData } from '../common/decorators/seeds.decorator';
import { Feedback } from './feedback.entity';

type SeedFeedback = {
  feedbackOrTechnical: string;
  satisfaction: string;
  improvements: string;
  visitReason: string;
  visitReasonOther: string;
  contactAuthority: string;
  contactAuthorityNoReason: string;
  problemArea: string;
  problemAreaPage: string;
  problemDescription: string;
  betaSurveyYesNo: string;
  betaSurveyEmail: string;
};

@Injectable()
export class FeedbackSeeder implements Seeder {
  @InjectData('feedback')
  data: SeedFeedback[];

  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
  ) {}

  async seed(): Promise<void> {
    await Promise.all(
      this.data.map(async (seedDataset) => {
        const feedback: Feedback = {
          id: undefined,
          feedbackOrTechnical: seedDataset.feedbackOrTechnical,
          satisfaction: seedDataset.satisfaction,
          improvements: seedDataset.improvements,
          visitReason: seedDataset.visitReason,
          visitReasonOther: seedDataset.visitReasonOther,
          contactAuthority: seedDataset.contactAuthority,
          contactAuthorityNoReason: seedDataset.contactAuthorityNoReason,
          problemArea: seedDataset.problemArea,
          problemAreaPage: seedDataset.problemAreaPage,
          problemDescription: seedDataset.problemDescription,
          betaSurveyYesNo: seedDataset.betaSurveyYesNo,
          betaSurveyEmail: seedDataset.betaSurveyEmail,
          created_at: undefined,
        };

        await this.feedbackRepository.save(feedback);
      }),
    );
  }

  async drop(): Promise<any> {
    await this.feedbackRepository.delete({});
  }
}
