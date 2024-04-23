import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'h21NumberFormat',
})
export class H21NumberFormatPipe implements PipeTransform {

  public transform(value: number): string {
    if (value) {
      return value % 1 === 0
        ? value.toLocaleString('de-DE')
        : value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  }

}
