import { Pipe, PipeTransform } from '@angular/core';

// interfaces
import { H21DateTime } from 'h21-be-ui-kit';

@Pipe({
  name: 'h21DateTransform',
})
export class H21DateTransformPipe implements PipeTransform {

  public transform(date: Date): H21DateTime {

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
