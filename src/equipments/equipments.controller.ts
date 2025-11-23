import {Controller, Get, Post, Param, Body, Query, ParseIntPipe, UsePipes, ValidationPipe, Put, UseInterceptors, UploadedFile, Res, HttpCode,HttpStatus} from '@nestjs/common';
import { EquipmentsService } from './equipments.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { UppercasePipe } from 'src/common/pipes/uppercase.pipe';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { CsvValidationPipe } from 'src/common/pipes/csv-validation.pipe';
import * as fs from 'fs'



@Controller('equipments')
export class EquipmentsController {
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
    // Parsează filtrele
    const filters: any = {};
    if (name) filters.name = name;
    if (type) filters.type = type;
    if (minPrice) filters.minPrice = parseFloat(minPrice);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
    if (available !== undefined) {
      filters.available = available === 'true';
    }

    const { filePath, filename } = await this.equipmentsService.exportToCsv(filters);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    // Șterge fișierul după trimitere
    fileStream.on('end', () => {
      fs.unlinkSync(filePath);
    });
  }

  @Get('list')
  getAll() {
    return this.equipmentsService.findAll();
  }

  @Get('/:id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.equipmentsService.findOne(id);
  }

  @Get('search')
  search(
    @Query('name') name?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
  ) {
    let results = this.equipmentsService.findAll();

    if (name)
      results = results.filter((e) =>
        e.name.toLowerCase().includes(name.toLowerCase()),
      );
    if (minPrice) results = results.filter((e) => e.pricePerDay >= +minPrice);
    if (maxPrice) results = results.filter((e) => e.pricePerDay <= +maxPrice);

    console.log('Results:', results);
    return results;
  }

  @Get('type/:type')
  findByType(@Param('type', UppercasePipe) type: string) {
    return this.equipmentsService.findByType(type);
  }

  @Post('add')
  create(@Body() createEquipmentDto: CreateEquipmentDto) {
    console.log('Creating equipment:', createEquipmentDto);
    return this.equipmentsService.create(createEquipmentDto);
  }

  @Put('/:id')
  update(
    @Param('id') id: string,
    @Body() updateEquipmentDto: UpdateEquipmentDto,
  ) {
    return this.equipmentsService.update(+id, updateEquipmentDto);
  }

} 
