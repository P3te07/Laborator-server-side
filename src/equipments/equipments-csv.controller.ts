import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  Res,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import type { Response } from 'express';
import { EquipmentsService } from './equipments.service';
import { CsvValidationPipe } from '../common/pipes/csv-validation.pipe';
import * as fs from 'fs';
import { Multer } from 'multer';


@Controller('equipments/csv')
export class EquipmentsCsvController {
  constructor(private readonly equipmentsService: EquipmentsService) {}

  @Post('import')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async importCsv(
    @UploadedFile(CsvValidationPipe) file: Express.Multer.File,
  ) {
    return this.equipmentsService.importFromCsv(file.buffer);
  }

  @Get('export')
  async exportCsv(
    @Res() res: Response,
    @Query('name') name?: string,
    @Query('type') type?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('available') available?: string,
  ) {
    const filters: any = {};
    if (name) filters.name = name;
    if (type) filters.type = type;
    if (minPrice) filters.minPrice = parseFloat(minPrice);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
    if (available !== undefined)
      filters.available = available === 'true';

    const { filePath, filename } = await this.equipmentsService.exportToCsv(filters);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('end', () => {
      fs.unlinkSync(filePath);
    });
  }
}
