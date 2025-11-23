import { Controller, Get, Post, Put, Delete, Param, Body, Query, ParseIntPipe, UseInterceptors, UploadedFile, Res, HttpCode, HttpStatus} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UppercasePipe } from '../common/pipes/uppercase.pipe';
import { CsvValidationPipe } from '../common/pipes/csv-validation.pipe';
import * as fs from 'fs';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('list')
  getAll() {
    return this.usersService.findAll();
  }

  @Get('details/:id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Get('name/:name')
  findByName(@Param('name', UppercasePipe) name: string) {
    return this.usersService.findByName(name);
  }

  @Post('add')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }


  @Post('import')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async importCsv(@UploadedFile(CsvValidationPipe) file: Express.Multer.File) {
    return this.usersService.importFromCsv(file.buffer);
  }

  @Get('export')
  async exportCsv(
    @Res() res: Response,
    @Query('name') name?: string,
    @Query('role') role?: string,
  ) {
    const filters: any = {};
    if (name) filters.name = name;
    if (role) filters.role = role;

    const { filePath, filename } = await this.usersService.exportToCsv(filters);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const fileStream = fs.createReadStream(filePath);
    
    fileStream.on('end', () => {
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error('Eroare la ștergerea fișierului temporar:', error);
      }
    });

    fileStream.on('error', (error) => {
      console.error('Eroare la citirea fișierului:', error);
      res.status(500).json({ error: 'Eroare la generarea fișierului CSV' });
    });

    fileStream.pipe(res);
  }
}