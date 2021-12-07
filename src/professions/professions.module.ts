import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profession } from './profession.entity';
import { ProfessionsController } from './professions.controller';
import { ProfessionsService } from './professions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Profession])],
  controllers: [ProfessionsController],
  providers: [ProfessionsService],
})
export class ProfessionsModule {}
