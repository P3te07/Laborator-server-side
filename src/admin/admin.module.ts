import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { EquipmentsModule } from '../equipments/equipments.module';

@Module({
  imports: [EquipmentsModule],  
  controllers: [AdminController],
})
export class AdminModule {}
