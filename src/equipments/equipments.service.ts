import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { CategoriesService } from '../categories/categories.service';
import { parse } from 'csv-parse/sync';
import { createObjectCsvWriter } from 'csv-writer';
import { format,  } from '@fast-csv/format';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import * as fs from 'fs'
import * as path from 'path'


@Injectable()
export class EquipmentsService {
  constructor(private readonly categoriesService: CategoriesService) {}

  private equipments = [
    { id: 1, name: 'Tractor John Deere 5075E', type: 'Tractor', pricePerDay: 120, available: true, location: 'Chișinău', year: 2018 },
    { id: 2, name: 'Combine Claas Lexion 760', type: 'Combine', pricePerDay: 450, available: false, location: 'Bălți', year: 2016 },
    { id: 3, name: 'Plug Lemken 4 brazde', type: 'Plug', pricePerDay: 60, available: true, location: 'Ungheni', year: 2012 },
    { id: 4, name: 'Semănătoare Amazone', type: 'Semănătoare', pricePerDay: 80, available: true, location: 'Cahul', year: 2019 },
    { id: 5, name: 'Cuțit cosechină', type: 'Atasament', pricePerDay: 25, available: true, location: 'Orhei', year: 2015 },
    { id: 6, name: 'Remorcă 6 tone', type: 'Remorcă', pricePerDay: 50, available: false, location: 'Soroca', year: 2014 },
    { id: 7, name: 'Fertilizer spreader', type: 'Distribuitor de îngrășăminte', pricePerDay: 45, available: true, location: 'Criuleni', year: 2017 },
    { id: 8, name: 'Cultivator Kverneland', type: 'Cultivator', pricePerDay: 70, available: true, location: 'Hâncești', year: 2013 },
    { id: 9, name: 'Buldoexcavator JCB', type: 'Buldoexcavator', pricePerDay: 200, available: false, location: 'Anenii Noi', year: 2011 },
    { id: 10, name: 'Stivuitor Toyota 2t', type: 'Stivuitor', pricePerDay: 90, available: true, location: 'Dubăsari', year: 2020 },
  ];

  findAll() {
    return this.equipments.map(equipment => {
      const category = this.categoriesService.findByName(equipment.type);
      return {
        ...equipment,
        categoryId: category ? category.id : null,
      };
    });
  }

  findOne(id: number) {
    const equipment = this.equipments.find(e => e.id === id);
    if (!equipment) {
      throw new NotFoundException(`Echipament cu id ${id} nu a fost găsit.`);
    }
    const category = this.categoriesService.findByName(equipment.type);
    return {
      ...equipment,
      categoryId: category ? category.id : null,
    };
  }

  findByType(type: string) {
    const results = this.equipments.filter(e => e.type.toLowerCase() === type.toLowerCase());
    if (results.length === 0) {
      throw new NotFoundException(`Nu s-au găsit echipamente de tipul ${type}.`);
    }
    return results.map(equipment => {
      const category = this.categoriesService.findByName(equipment.type);
      return {
        ...equipment,
        categoryId: category ? category.id : null,
      };
    });
  }

  create(createEquipmentDto: CreateEquipmentDto) {
    const newEquipment = {
      id: this.equipments.length + 1,
      ...createEquipmentDto,
    };
    this.equipments.push(newEquipment);
    return newEquipment;
  }

  update(id: number, updateEquipmentDto: UpdateEquipmentDto) {
    let equipment = this.findOne(id);

    equipment = {
      ...equipment,
      type: updateEquipmentDto.type ?? equipment.type,
      pricePerDay: updateEquipmentDto.pricePerDay ?? equipment.pricePerDay,
      available: updateEquipmentDto.available ?? equipment.available,
      location: updateEquipmentDto.location ?? equipment.location,
      year: updateEquipmentDto.year ?? equipment.year
    };

    this.equipments[this.equipments.findIndex(e => e.id === id)] = equipment;
    return equipment;
  }
  
  async importFromCsv(buffer: Buffer): Promise<any> {
    const csvText = buffer.toString('utf-8');
    
    // Parsează CSV
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

    // Verifică numărul de coloane
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

    // Validează fiecare rând
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      
      // Creează DTO
      const dto = plainToClass(CreateEquipmentDto, {
        name: record.name?.trim(),
        type: record.type?.trim(),
        pricePerDay: parseFloat(record.pricePerDay),
        available: record.available === 'true' || record.available === 'TRUE',
        location: record.location?.trim(),
        year: parseInt(record.year, 10),
      });

      // Validează cu class-validator
      const errors = await validate(dto);

      if (errors.length === 0) {
        // Date valide - salvează
        const newEquipment = {
          id: this.equipments.length + 1,
          ...dto,
        };
        this.equipments.push(newEquipment);
        validRecords.push({
          row: i + 1,
          data: dto,
        });
      } else {
        // Date invalide - adaugă la lista de erori
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

    // Răspuns JSON
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

  /**
   * Export CSV - generează fișier CSV cu datele filtrate
   */
  async exportToCsv(filters?: {
    name?: string;
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    available?: boolean;
  }): Promise<{ filePath: string; filename: string }> {
    
    let data = [...this.equipments];

    // Aplică filtre
   if (filters) {
      if (filters.name) {
        data = data.filter(e => 
          e.name.toLowerCase().includes(filters.name!.toLowerCase())
        );
      }
      if (filters.type) {
        data = data.filter(e => 
          e.type.toLowerCase() === filters.type!.toLowerCase()
        );
      }
      if (filters.minPrice !== undefined) {
        data = data.filter(e => e.pricePerDay >= filters.minPrice!);
      }
      if (filters.maxPrice !== undefined) {
        data = data.filter(e => e.pricePerDay <= filters.maxPrice!);
      }
      if (filters.available !== undefined) {
        data = data.filter(e => e.available === filters.available!);
      }
    }

    // Creează fișier CSV
    const filename = `equipments_export_${Date.now()}.csv`;
    const filePath = path.join(process.cwd(), 'uploads', filename);

    // Asigură-te că directorul uploads există
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