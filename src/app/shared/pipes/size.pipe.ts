import { Pipe, PipeTransform } from '@angular/core';

// constants
import { Units } from '../constants';

@Pipe({
  name: 'size',
})
export class SizePipe implements PipeTransform {

  public transform(bytes: number, unit: number): string {
    if (bytes) {
      const units = Object.keys(Units);
      let unitIndex = unit;
      let n = parseInt(String(bytes), 10) || 0;

      while (n >= 1024 && ++unitIndex) {
        n = n / 1024;
      }
      const result = n.toFixed(n >= 10 || unitIndex < 1 ? 0 : 1);
      return `${result} ${units[unitIndex]}`;
    }
  }

}

