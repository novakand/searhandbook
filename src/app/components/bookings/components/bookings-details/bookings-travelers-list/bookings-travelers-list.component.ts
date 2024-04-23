import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

// interfaces
import { ITravelerListItem } from '../../../interfaces';

@Component({
  selector: 'h21-bookings-travelers-list',
  templateUrl: './bookings-travelers-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
 })
export class BookingsTravelersListComponent implements OnInit {

  @Input() public data: ITravelerListItem[];

  constructor() { }

  public ngOnInit(): void { }

  public trackByFn(index: number): number {
    return index;
  }

}
