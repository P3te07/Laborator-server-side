import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  private users = [
    { id: 1, name: 'Admin', role: 'admin' },
    { id: 2, name: 'John', role: 'user' },
  ];

  findAll() { return this.users; }
  findOne(id: number) { return this.users.find(u => u.id === id); }
}