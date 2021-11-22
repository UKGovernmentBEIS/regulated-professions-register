import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Legislation } from './legislation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Legislation])],
})
export class LegislationModule {}
