import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organisation } from './organisation.entity';
import { OrganisationsService } from './organisations.service';
import { OrganisationsController } from './admin/organisations.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Organisation])],
  providers: [OrganisationsService],
  controllers: [OrganisationsController],
})
export class OrganisationsModule {}
