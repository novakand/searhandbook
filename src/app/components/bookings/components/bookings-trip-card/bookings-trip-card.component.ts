import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// external libs
import { Subject } from 'rxjs';

// services
import { ReportService } from '@core/services';

// enums
import { SearchMode } from '../../../search/enums/index';

// interfaces
import { ITripSegment } from '@core/interfaces';
import { LoadProgressService } from 'h21-be-ui-kit';

@Component({
  selector: 'h21-bookings-trip-card',
  templateUrl: './bookings-trip-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ReportService],
})
export class BookingsTripCardComponent implements OnInit {

  public showImg = true;

  public tripId: number;
  public tripName: string;
  public itemTypes = SearchMode;
  public items$ = new Subject<ITripSegment[]>();

  constructor(
    private _route: ActivatedRoute,
    private _reportService: ReportService,
    private _loadProgressService: LoadProgressService,
  ) {
    this._loadProgressService.show(1);
  }

  public ngOnInit(): void {
    this.tripId = +this._route.snapshot.paramMap.get('id');
    this._getTrip();
  }

  public trackByFn(index: number): number {
    return index;
  }

  private _getTrip(): void {
    this._reportService.getTrip(this.tripId)
      .subscribe(({ name, id, segments }) => {
        this.tripName = name;
        this.tripId = id;
        this._reportService.addCancellationClass(segments);
        this.items$.next(segments);
        this._loadProgressService.hide(1);
      });
  }

}
