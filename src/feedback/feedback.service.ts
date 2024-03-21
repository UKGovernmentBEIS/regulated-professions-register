import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from './feedback.entity';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private repository: Repository<Feedback>,
  ) {}

  all(): Promise<Feedback[]> {
    return this.repository.find();
  }

  async save(feedback: Feedback): Promise<Feedback> {
    return this.repository.save(feedback);
  }
}
