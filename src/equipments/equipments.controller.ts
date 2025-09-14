import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { EquipmentsService } from './equipments.service';

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
}
