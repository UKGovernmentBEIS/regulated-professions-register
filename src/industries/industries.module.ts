import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndustriesService } from './industries.service';
import { Industry } from './industry.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Industry])],
  providers: [IndustriesService],
})
export class IndustriesModule {}
