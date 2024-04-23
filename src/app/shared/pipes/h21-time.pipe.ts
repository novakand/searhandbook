import { Pipe, PipeTransform } from '@angular/core';

// interfaces
import { H21DateTime } from 'h21-be-ui-kit';

@Pipe({
  name: 'h21Time',
})
export class H21TimePipe implements PipeTransform {

  public transform(time: H21DateTime): string {
    const { hour, minute } = time;

    return `${hour < 10 ? this._addZero(hour) : hour}:${minute < 10 ? this._addZero(minute) : minute}`;
  }

  private _addZero(value: number): string {
    return `0${value}`;
  }

}
