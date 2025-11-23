import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Equipment } from './entities/equipment.entity';
import { EquipmentsController } from './equipments.controller';
import { EquipmentsService } from './equipments.service';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [TypeOrmModule.forFeature([Equipment]),CategoriesModule],
  controllers: [EquipmentsController],
  providers: [EquipmentsService],
  exports: [EquipmentsService],
})
export class EquipmentsModule {}