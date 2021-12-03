import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organisation } from './organisation.entity';
import { OrganisationsService } from './organisations.service';

@Module({
  imports: [TypeOrmModule.forFeature([Organisation])],
  providers: [OrganisationsService],
})
export class OrganisationsModule {}
