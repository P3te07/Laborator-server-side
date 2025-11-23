import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { IsValidCategoryConstraint } from './is-valid-category.validator';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService, IsValidCategoryConstraint],
  exports: [CategoriesService, IsValidCategoryConstraint]  
})
export class CategoriesModule {}
