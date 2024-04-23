import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'getCompanyNameText',
})
export class GetCompanyNameTextPipe implements PipeTransform {

  public transform(text: string): string {
    if (!text) { return ''; }

    const arr = text.split(',');
    const n = arr.length < 3 ? arr.length : 3;
    if (n > 1) {
      let result = '';
      for (let i = 0; i < n; i++) {
        result += `${arr[i]}\n`;
      }
      return result += n > 3 ? '...' : '';
    }

    return text;
  }

}
