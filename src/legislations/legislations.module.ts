import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Legislation } from './legislation.entity';
import { LegislationsService } from './legislations.service';

@Module({
  imports: [TypeOrmModule.forFeature([Legislation])],
  providers: [LegislationsService],
})
export class LegislationsModule {}
