import {Controller, Get, Post, Patch, Param, Body, Query, ParseIntPipe, UsePipes, ValidationPipe,} from '@nestjs/common';
import { EquipmentsService } from './equipments.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { UppercasePipe } from 'src/uppercase/uppercase.pipe';

@Controller('equipments')
export class EquipmentsController {
  constructor(private readonly equipmentsService: EquipmentsService) {}

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
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  create(@Body() createEquipmentDto: CreateEquipmentDto) {
    console.log('Creating equipment:', createEquipmentDto);
    return this.equipmentsService.create(createEquipmentDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEquipmentDto: UpdateEquipmentDto,
  ) {
    return this.equipmentsService.update(+id, updateEquipmentDto);
  }

} 
