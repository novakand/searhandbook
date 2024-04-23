import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'h21CardFormat',
})
export class H21CardFormat implements PipeTransform {

  public transform(card: string): string {
    if (card) {
      return card.replace(/(.{4})/g, '$1 ').trim();
    }
  }

}
