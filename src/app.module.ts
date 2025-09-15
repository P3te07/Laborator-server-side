import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EquipmentsModule } from './equipments/equipments.module';
import { UsersModule } from './users/users.module';
import { AdminController } from './admin/admin.controller';
import { AdminModule } from './admin/admin.module';
import { RolesMiddleware } from './common/middleware/roles.middleware';


@Module({
  imports: [EquipmentsModule, UsersModule, AdminModule],
  controllers: [AppController, AdminController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer){
    consumer
      .apply(RolesMiddleware)
      .forRoutes({ path: 'admin/*', method: RequestMethod.ALL });
  }
}
