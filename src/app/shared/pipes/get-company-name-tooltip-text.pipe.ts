import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'getCompanyNameTooltipText',
})
export class GetCompanyNameTooltipTextPipe implements PipeTransform {

  public transform(text: string): string {
    if (!text) { return null; }

    const arr = text.split(',');
    const n = arr.length;
    if (n > 3) {
      let result = 'Traveller companies:\n';
      for (let i = 0; i < n; i++) {
        result += `${arr[i]}\n`;
      }
      return result;
    }

    return null;
  }

}
