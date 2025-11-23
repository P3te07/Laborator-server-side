import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@ValidatorConstraint({ name: 'isValidCategory', async: false })
@Injectable()
export class IsValidCategoryConstraint implements ValidatorConstraintInterface {
  constructor(private readonly categoriesService: CategoriesService) {}

  validate(type: string, args: ValidationArguments) {
    const category = this.categoriesService.findByName(type);
    return category !== null && category !== undefined;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Tipul specificat nu există ca și categorie.';
  }
}

export function IsValidCategory(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidCategoryConstraint,
    });
  };
}