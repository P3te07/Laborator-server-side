import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class UppercasePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    console.log('Before transform:', value); 
    const transformed = typeof value === 'string' ? value.toUpperCase() : value;
    console.log('After transform:', transformed); 
    return transformed;
  }
}

