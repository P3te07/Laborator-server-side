import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class UppercasePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
  console.log('Before:', value);
  if (typeof value === 'string') {
    const upper = value.toUpperCase();
    console.log('After:', upper);
    return upper;
  }
  return value;
}

}
