import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { UppercasePipe } from 'src/common/pipes/uppercase.pipe';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('list')
  getAll() { return this.usersService.findAll(); }

  @Get('details/:id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }
  @Get('name/:name')
  findByName(@Param('name', UppercasePipe) name: string) {
    return this.usersService.findByName(name);
  }
}