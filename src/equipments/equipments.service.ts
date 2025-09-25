import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class EquipmentsService {
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
    { id: 10, name: 'Stivuitor Toyota 2t', type: 'Stivuitor', pricePerDay: 90, available: true, location: 'Dubăsari', year: 2020 }
  ];

  findAll() {
    return this.equipments;
  }

  findOne(id: number) {
    const item = this.equipments.find(e => e.id === id);
    if (!item) throw new NotFoundException(`Echipament cu id ${id} nu a fost găsit.`);
    return item;
  }
  findByType(type:string){
    return this.equipments.find(u => u.type === type);
  }
}
