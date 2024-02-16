import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbackService } from './feedback.service';
import { Feedback } from './feedback.entity';
import { FeedbackController } from './feedback.controller';
import { FeedbackController as AdminFeedbackController } from './admin/feedback.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Feedback])],
  providers: [FeedbackService],
  controllers: [FeedbackController, AdminFeedbackController],
  exports: [FeedbackService],
})
export class FeedbackModule {}
