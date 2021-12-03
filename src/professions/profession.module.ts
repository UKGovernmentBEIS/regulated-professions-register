import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profession } from './profession.entity';
import { ProfessionService } from './profession.service';

@Module({
  imports: [TypeOrmModule.forFeature([Profession])],
  providers: [ProfessionService],
})
export class ProfessionModule {}
