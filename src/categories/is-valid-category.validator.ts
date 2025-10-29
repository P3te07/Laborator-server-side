import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { CategoriesService } from 'src/categories/categories.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsValidCategoryConstraint implements ValidatorConstraintInterface {
  constructor(private readonly categoriesService: CategoriesService) {}

  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    if (typeof value !== 'string') {
      return false;
    }
    const cat = await this.categoriesService.findByName(value);
    return cat !== null;
  }

  defaultMessage(args: ValidationArguments): string {
    return `Tipul '${args.value}' nu este o categorie valida`;
  }
}

export function IsValidCategory(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidCategoryConstraint,
    });
  };
}
