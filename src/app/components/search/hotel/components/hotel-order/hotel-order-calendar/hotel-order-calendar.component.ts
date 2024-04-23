import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

// external libs
import * as moment from 'moment';

// interfaces
import { ICalendarRoom } from '@hotel/interfaces';

@Component({
  selector: 'h21-hotel-order-calendar',
  templateUrl: './hotel-order-calendar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HotelOrderCalendarComponent implements OnInit {

  @Input() public list: ICalendarRoom[];

  public weekDayNames: string[] = [ 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa' ];
  public toolbarMonths: string[] = [];
  public cells: any = [];
  public currentIndex = 0;

  private _startDate: Date;
  private _finishDate: Date;

  public ngOnInit(): void {
    if (this.list && this.list.length > 0) {
      this._setRangeEdges();
      this._setCells();
    }
  }

  public trackByFn(index: number): number {
    return index;
  }

  private _setRangeEdges(): void {
    const dates = this.list.map((v) => moment(v.date).utc());
    this._startDate = moment.min(...dates).toDate();
    this._finishDate = moment.max(...dates).toDate();
    this.toolbarMonths = Array.from(new Set(dates.map((v) => v.format('MMMM YYYY'))));
  }

  private _setCells(): void {
    const date = new Date(this._startDate.getFullYear(), this._startDate.getMonth(), 1);
    const endDate = new Date(this._finishDate.getFullYear(), this._finishDate.getMonth(), 1);

    do {
      this.cells.push(this._getMonthCells(date.getFullYear(), date.getMonth()));
      date.setMonth(date.getMonth() + 1);
    } while (date.getTime() <= endDate.getTime());
  }

  private _getMonthCells(year: number, month: number): any {
    const oneDayTime = 86400000; // day in ms;

    const cells = [];
    const weeks = [];

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month, this._getDaysInMonth(firstDay));

    for (let i = 0; i < firstDay.getDay(); i++) { cells.push(null); }

    let day = new Date(firstDay);

    while (day <= lastDay) {
      const data = this._getPriceByDate(day);
      cells.push({ date: day.getDate(), price: data.cost, currency: data.currency });
      day = new Date(day.getTime() + oneDayTime);
    }

    const padRight = 6 - lastDay.getDay();
    for (let i = 0; i < padRight; i++) { cells.push(null); }

    while (cells.length > 0) { weeks.push(cells.splice(0, 7)); }

    return weeks;
  }

  private _getPriceByDate(date: Date): ICalendarRoom {
    const day = moment(date).format('YYYY-MM-DD');
    const index = this.list.findIndex((v) => v.date.substr(0, 10) === day);
    return index >= 0 ? this.list[index] : { cost : null, currency: null };
  }

  private _getDaysInMonth(date: Date): number {
    return 33 - new Date(date.getFullYear(), date.getMonth(), 33).getDate();
  }

}
