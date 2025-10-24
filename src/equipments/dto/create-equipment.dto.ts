import { IsString, IsNumber, IsBoolean, IsOptional, Length } from 'class-validator';

export class CreateEquipmentDto {
  @IsString()
  @Length(3, 60, { message: 'Numele echipamentului trebuie să aibă între 3 și 60 caractere.' })
  name: string;

  @IsString({ message: 'Tipul trebuie să fie un string valid.' })
  type: string;

  @IsNumber({}, { message: 'Prețul per zi trebuie să fie un număr.' })
  pricePerDay: number;

  @IsBoolean({ message: 'Câmpul available trebuie să fie boolean (true/false).' })
  available: boolean;

  @IsString({ message: 'Locația trebuie să fie un string valid.' })
  location: string;

  @IsNumber({}, { message: 'Anul trebuie să fie un număr valid.' })
  year: number;
}
