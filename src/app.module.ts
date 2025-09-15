import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EquipmentsModule } from './equipments/equipments.module';
import { UsersModule } from './users/users.module';
import { AdminController } from './admin/admin.controller';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [EquipmentsModule, UsersModule, AdminModule],
  controllers: [AppController, AdminController],
  providers: [AppService],
})
export class AppModule {}
