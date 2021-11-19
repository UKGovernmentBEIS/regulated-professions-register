import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Legislation } from './legislation.entity';
import { LegislationService } from './legislation.service';

@Module({
  imports: [TypeOrmModule.forFeature([Legislation])],
  providers: [LegislationService],
})
export class LegislationModule {}
