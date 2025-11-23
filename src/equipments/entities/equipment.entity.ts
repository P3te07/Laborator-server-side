import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('Equipments')
export class Equipment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'nvarchar', length: 60 })
  name: string;

  @Column({ type: 'nvarchar', length: 50 })
  type: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  pricePerDay: number;

  @Column({ type: 'bit', default: 1 })
  available: boolean;

  @Column({ type: 'nvarchar', length: 100 })
  location: string;

  @Column({ type: 'int' })
  year: number;

  @CreateDateColumn({ type: 'datetime2' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime2' })
  updatedAt: Date;
}