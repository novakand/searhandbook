import { Pipe, PipeTransform } from '@angular/core';

// interfaces
import { H21DateTime, Utils } from 'h21-be-ui-kit';

@Pipe({
  name: 'h21StringToDate',
})
export class H21StringToDatePipe implements PipeTransform {

  public transform(value: string): string {
    const utc = Utils.getUTCDate(new Date(value));
    const date = this._toH21Date(utc);

    const { day, year } = date;
    return `${this._correctValue(day)} ${this._getMonthName(utc)} ${year}`;
  }

  private _correctValue(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }

  private _getMonthName(date: Date): string {
    return date.toLocaleString('en', { month: 'short' });
  }

  private _toH21Date(date: Date): H21DateTime {

    const dateTime = new H21DateTime();
    dateTime.year = date.getFullYear();
    dateTime.month = date.getMonth() + 1;
    dateTime.day = date.getDate();
    dateTime.hour = date.getHours();
    dateTime.minute = date.getMinutes();
    dateTime.second = date.getSeconds();

    return dateTime;
  }

}
