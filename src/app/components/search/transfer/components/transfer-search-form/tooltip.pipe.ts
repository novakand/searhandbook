import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tooltip',
})
export class TooltipPipe implements PipeTransform {

  public transform(value: string): string {
    return value && value.length > 33 ? value : '';
  }

}
