import { Injectable } from '@nestjs/common';

@Injectable()
export class CategoriesService {
  private categories = [
    { id: 1, name: 'Tractor' },
    { id: 2, name: 'Combine' },
    { id: 3, name: 'Plug' },
    { id: 4, name: 'Semănătoare' },
    { id: 5, name: 'Atasament' },
    { id: 6, name: 'Remorcă' },
    { id: 7, name: 'Distribuitor de îngrășăminte' },
    { id: 8, name: 'Cultivator' },
    { id: 9, name: 'Buldoexcavator' },
    { id: 10, name: 'Stivuitor' },
  ];

  findAll() {
    return this.categories;
  }

  findById(id: number) {
    return this.categories.find(c => c.id === id) || null;
  }

  findByName(name: string): { id: number; name: string } | null {
    if (!name) {
      return null;
    }
    return (
      this.categories.find(c => {
        if (!c.name) {
          return false;
        }
        return c.name.toLowerCase() === name.toLowerCase();
      }) || null
    );
  }
}
