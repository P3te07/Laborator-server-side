import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EquipmentsModule } from './equipments/equipments.module';
import { UsersModule } from './users/users.module';
import { AdminController } from './admin/admin.controller';
import { AdminModule } from './admin/admin.module';
import { RolesMiddleware } from './common/middleware/roles.middleware';
import { Equipment } from './equipments/entities/equipment.entity';
import { User } from './users/entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRoot({
      type: 'mssql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '1433'),
      username: process.env.DB_USERNAME || 'ag_app_user',
      password: process.env.DB_PASSWORD || 'HelloWorld!',
      database: process.env.DB_DATABASE || 'EchipamenteDB',
      entities: [Equipment, User],
      synchronize: true,
      logging: true,
      options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
      },
    }),
    EquipmentsModule,
    UsersModule,
    AdminModule,
  ],
  controllers: [AppController, AdminController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RolesMiddleware)
      .forRoutes({ path: 'admin/*', method: RequestMethod.ALL });
  }
}