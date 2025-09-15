import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { EquipmentsService } from '../equipments/equipments.service';

@Controller('admin/equipments')
export class AdminController {
  constructor(private readonly equipmentsService: EquipmentsService) {}

  @Get('edit/:id')
  edit(@Param('id', ParseIntPipe) id: number) {
    return this.equipmentsService.findOne(id); // return la obiect pt endpoint
  }
}
