import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { parse } from 'csv-parse/sync';
import { createObjectCsvWriter } from 'csv-writer';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

    async findAll() {
    return await this.usersRepository.find({
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User cu id ${id} nu a fost găsit.`);
    }
    return user;
  }

  async findByName(name: string) {
    const user = await this.usersRepository.findOne({ 
      where: { name: Like(`%${name}%`) } 
    });
    if (!user) {
      throw new NotFoundException(`User cu numele ${name} nu a fost găsit.`);
    }
    return user;
  }

  async create(createUserDto: CreateUserDto) {
    const user = this.usersRepository.create(createUserDto);
    return await this.usersRepository.save(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return await this.usersRepository.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
    return { message: `User cu id ${id} a fost șters.` };
  }

  async importFromCsv(buffer: Buffer): Promise<any> {
    const csvText = buffer.toString('utf-8');
    
    let records;
    try {
      records = parse(csvText, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
      });
    } catch (error) {
      throw new BadRequestException('Fișierul CSV nu poate fi parsat. Verifică formatul.');
    }

    if (!records || records.length === 0) {
      throw new BadRequestException('Fișierul CSV nu conține date.');
    }

    const expectedColumns = ['name', 'role'];
    const actualColumns = Object.keys(records[0]);
    
    const missingColumns = expectedColumns.filter(col => !actualColumns.includes(col));
    if (missingColumns.length > 0) {
      throw new BadRequestException(
        `Coloane lipsă în CSV: ${missingColumns.join(', ')}. Coloane așteptate: ${expectedColumns.join(', ')}`
      );
    }

    const validRecords: any[] = [];
    const invalidRecords: any[] = [];

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      
      const dto = plainToClass(CreateUserDto, {
        name: record.name?.trim(),
        role: record.role?.trim(),
      });

      const errors = await validate(dto);

      if (errors.length === 0) {
        const user = this.usersRepository.create(dto);
        const saved = await this.usersRepository.save(user);
        validRecords.push({
          row: i + 1,
          data: saved,
        });
      } else {
        const errorMessages = errors.map(error => ({
          field: error.property,
          constraints: error.constraints,
        }));
        invalidRecords.push({
          row: i + 1,
          data: record,
          errors: errorMessages,
        });
      }
    }

    return {
      message: `Import finalizat: ${validRecords.length} utilizatori valizi din ${records.length} rânduri totale.`,
      summary: {
        total: records.length,
        valid: validRecords.length,
        invalid: invalidRecords.length,
      },
      validRecords: validRecords.map(r => r.data),
      invalidRecords: invalidRecords.length > 0 ? invalidRecords : undefined,
    };
  }


  async exportToCsv(filters?: {
    name?: string;
    role?: string;
  }): Promise<{ filePath: string; filename: string }> {
    
    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    if (filters?.name) {
      queryBuilder.andWhere('user.name LIKE :name', { 
        name: `%${filters.name}%` 
      });
    }
    if (filters?.role) {
      queryBuilder.andWhere('user.role = :role', { 
        role: filters.role 
      });
    }

    const data = await queryBuilder.getMany();

    const filename = `users_export_${Date.now()}.csv`;
    const filePath = path.join(process.cwd(), 'uploads', filename);

    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: 'id', title: 'ID' },
        { id: 'name', title: 'Nume' },
        { id: 'role', title: 'Rol' },
      ],
    });

    await csvWriter.writeRecords(data);

    return { filePath, filename };
  }
}