import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Qualification } from './qualification.entity';
import { QualificationService } from './qualification.service';

@Module({
  imports: [TypeOrmModule.forFeature([Qualification])],
  providers: [QualificationService],
})
export class QualificationModule {}
