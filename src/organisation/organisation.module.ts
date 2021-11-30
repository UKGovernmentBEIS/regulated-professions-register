import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organisation } from './organisation.entity';
import { OrganisationService } from './organisation.service';

@Module({
  imports: [TypeOrmModule.forFeature([Organisation])],
  providers: [OrganisationService],
})
export class OrganisationModule {}
