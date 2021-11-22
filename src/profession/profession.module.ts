import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profession } from './profession.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Profession])],
})
export class ProfessionModule {}
