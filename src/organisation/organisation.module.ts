import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organisation } from './organisation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Organisation])],
})
export class OrganisationModule {}
