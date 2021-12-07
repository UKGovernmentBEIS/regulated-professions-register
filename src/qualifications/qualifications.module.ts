import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Qualification } from './qualification.entity';
import { QualificationsService } from './qualifications.service';

@Module({
  imports: [TypeOrmModule.forFeature([Qualification])],
  providers: [QualificationsService],
})
export class QualificationsModule {}
