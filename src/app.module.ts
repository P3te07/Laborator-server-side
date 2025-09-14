import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EquipmentsModule } from './equipments/equipments.module';

@Module({
  imports: [EquipmentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
