import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class CsvValidationPipe implements PipeTransform {
  private readonly MAX_SIZE = 2 * 1024 * 1024; // 2MB
  private readonly ALLOWED_MIMETYPES = ['text/csv', 'application/vnd.ms-excel'];

  transform(file: Express.Multer.File) {
    // Verifică dacă fișierul există
    if (!file) {
      throw new BadRequestException('Niciun fișier nu a fost trimis.');
    }

    // Verifică tipul MIME
    if (!this.ALLOWED_MIMETYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Tip fișier invalid. Se acceptă doar CSV. Primit: ${file.mimetype}`
      );
    }

    // Verifică extensia fișierului
    if (!file.originalname.toLowerCase().endsWith('.csv')) {
      throw new BadRequestException(
        'Extensia fișierului trebuie să fie .csv'
      );
    }

    // Verifică dimensiunea
    if (file.size > this.MAX_SIZE) {
      throw new BadRequestException(
        `Fișierul depășește dimensiunea maximă de 2MB. Dimensiune: ${(file.size / 1024 / 1024).toFixed(2)}MB`
      );
    }

    // Verifică dacă fișierul este gol
    if (file.size === 0) {
      throw new BadRequestException('Fișierul este gol.');
    }

    return file;
  }
}