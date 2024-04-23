import { Pipe, PipeTransform } from '@angular/core';

// interfaces
import { H21DateTime, Utils } from 'h21-be-ui-kit';

@Pipe({
  name: 'h21Date',
})
export class H21DatePipe implements PipeTransform {

  public transform(time: H21DateTime): string {
    if (time) {
      const { month, day, year } = time;
      const utc = Utils.getUTCDate(new Date(year, month - 1, day));
      return `${this._correctValue(day)} ${this._getMonthName(utc)} ${year}`;
    }
  }

  private _correctValue(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }

  private _getMonthName(date: Date): string {
    return date.toLocaleString('en', { month: 'short' });
  }

}
