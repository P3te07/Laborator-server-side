import { Module } from '@nestjs/common';
import { EquipmentsController } from './equipments.controller';
import { EquipmentsService } from './equipments.service';
import { CategoriesModule } from '../categories/categories.module';
import { IsValidCategory, IsValidCategoryConstraint } from 'src/categories/is-valid-category.validator';


@Module({
  imports: [CategoriesModule],  
  controllers: [EquipmentsController],
  providers: [EquipmentsService, IsValidCategoryConstraint],
  exports: [EquipmentsService, IsValidCategoryConstraint],
})
export class EquipmentsModule {}
