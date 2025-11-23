import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Equipment } from './entities/equipment.entity';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { CategoriesService } from '../categories/categories.service';
import { parse } from 'csv-parse/sync';
import { createObjectCsvWriter } from 'csv-writer';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EquipmentsService {
  constructor(
    @InjectRepository(Equipment)
    private equipmentsRepository: Repository<Equipment>,
    private readonly categoriesService: CategoriesService,
  ) {}

  async findAll() {
    return await this.equipmentsRepository.find({
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number) {
    const equipment = await this.equipmentsRepository.findOne({ 
      where: { id } 
    });
    if (!equipment) {
      throw new NotFoundException(`Echipament cu id ${id} nu a fost găsit.`);
    }
    return equipment;
  }

  async findByType(type: string) {
    const results = await this.equipmentsRepository.find({
      where: { type: Like(`%${type}%`) },
    });
    if (results.length === 0) {
      throw new NotFoundException(`Nu s-au găsit echipamente de tipul ${type}.`);
    }
    return results;
  }

  async create(createEquipmentDto: CreateEquipmentDto) {
    const equipment = this.equipmentsRepository.create(createEquipmentDto);
    return await this.equipmentsRepository.save(equipment);
  }

  async update(id: number, updateEquipmentDto: UpdateEquipmentDto) {
    const equipment = await this.findOne(id);
    Object.assign(equipment, updateEquipmentDto);
    return await this.equipmentsRepository.save(equipment);
  }

  async remove(id: number) {
    const equipment = await this.findOne(id);
    await this.equipmentsRepository.remove(equipment);
    return { message: `Echipament cu id ${id} a fost șters.` };
  }

  async search(filters: {
    name?: string;
    minPrice?: number;
    maxPrice?: number;
  }) {
    const queryBuilder = this.equipmentsRepository.createQueryBuilder('equipment');

    if (filters.name) {
      queryBuilder.andWhere('equipment.name LIKE :name', { 
        name: `%${filters.name}%` 
      });
    }
    if (filters.minPrice !== undefined) {
      queryBuilder.andWhere('equipment.pricePerDay >= :minPrice', { 
        minPrice: filters.minPrice 
      });
    }
    if (filters.maxPrice !== undefined) {
      queryBuilder.andWhere('equipment.pricePerDay <= :maxPrice', { 
        maxPrice: filters.maxPrice 
      });
    }

    return await queryBuilder.getMany();
  }

  // ========== CSV IMPORT ==========

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

    const expectedColumns = ['name', 'type', 'pricePerDay', 'available', 'location', 'year'];
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
      
      const dto = plainToClass(CreateEquipmentDto, {
        name: record.name?.trim(),
        type: record.type?.trim(),
        pricePerDay: parseFloat(record.pricePerDay),
        available: record.available === 'true' || record.available === 'TRUE',
        location: record.location?.trim(),
        year: parseInt(record.year, 10),
      });

      const errors = await validate(dto);

      if (errors.length === 0) {
        const equipment = this.equipmentsRepository.create(dto);
        const saved = await this.equipmentsRepository.save(equipment);
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
      message: `Import finalizat: ${validRecords.length} înregistrări valide din ${records.length} rânduri totale.`,
      summary: {
        total: records.length,
        valid: validRecords.length,
        invalid: invalidRecords.length,
      },
      validRecords: validRecords.map(r => r.data),
      invalidRecords: invalidRecords.length > 0 ? invalidRecords : undefined,
    };
  }

  // ========== CSV EXPORT ==========

  async exportToCsv(filters?: {
    name?: string;
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    available?: boolean;
  }): Promise<{ filePath: string; filename: string }> {
    
    const queryBuilder = this.equipmentsRepository.createQueryBuilder('equipment');

    if (filters?.name) {
      queryBuilder.andWhere('equipment.name LIKE :name', { 
        name: `%${filters.name}%` 
      });
    }
    if (filters?.type) {
      queryBuilder.andWhere('equipment.type = :type', { 
        type: filters.type 
      });
    }
    if (filters?.minPrice !== undefined) {
      queryBuilder.andWhere('equipment.pricePerDay >= :minPrice', { 
        minPrice: filters.minPrice 
      });
    }
    if (filters?.maxPrice !== undefined) {
      queryBuilder.andWhere('equipment.pricePerDay <= :maxPrice', { 
        maxPrice: filters.maxPrice 
      });
    }
    if (filters?.available !== undefined) {
      queryBuilder.andWhere('equipment.available = :available', { 
        available: filters.available 
      });
    }

    const data = await queryBuilder.getMany();

    const filename = `equipments_export_${Date.now()}.csv`;
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
        { id: 'type', title: 'Tip' },
        { id: 'pricePerDay', title: 'Pret pe Zi (MDL)' },
        { id: 'available', title: 'Disponibil' },
        { id: 'location', title: 'Locatie' },
        { id: 'year', title: 'An' },
      ],
    });

    await csvWriter.writeRecords(data);

    return { filePath, filename };
  }
}