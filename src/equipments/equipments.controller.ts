import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { EquipmentsService } from './equipments.service';
import { UppercasePipe } from 'src/uppercase/uppercase.pipe';

@Controller('equipments')
export class EquipmentsController {
  constructor(private readonly equipmentsService: EquipmentsService) {}

  @Get('list')
  getAll() {
    return this.equipmentsService.findAll();
  }

  @Get('details/:id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.equipmentsService.findOne(id);
  }

  @Get('search')
  search(
    @Query('name') name?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
  ){
    let results = this.equipmentsService.findAll();
        if (name) results = results.filter (e => e.name.toLowerCase().includes(name.toLocaleLowerCase()));
        if (minPrice) results = results.filter (e => e.pricePerDay >= Number(minPrice));
        if (maxPrice) results = results.filter (e => e.pricePerDay <= Number(maxPrice));
        console.log("Results:",results);
        return results;
    }
  @Get('type/:type')
  findByType(@Param('type', UppercasePipe) type: string) {
    return this.equipmentsService.findByType(type);
  }

}
