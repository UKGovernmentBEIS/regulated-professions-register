import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profession } from './profession.entity';
import { ProfessionsService } from './professions.service';
import { ProfessionsController } from './professions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Profession])],
  providers: [ProfessionsService],
  controllers: [ProfessionsController],
})
export class ProfessionsModule {}
