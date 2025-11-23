import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Numele nu poate fi gol.' })
  @Length(2, 100, { message: 'Numele trebuie să aibă între 2 și 100 caractere.' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Rolul nu poate fi gol.' })
  @Length(2, 50, { message: 'Rolul trebuie să aibă între 2 și 50 caractere.' })
  role: string;
}