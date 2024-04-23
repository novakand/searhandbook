import { ChangeDetectorRef, ElementRef, Injectable, OnDestroy, ViewRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { fromEvent, Subject } from 'rxjs';
import { debounceTime, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';

// lib
import { Application, DEFAULT_TABLE_ORDER, IQueryResult, Query } from 'h21-be-ui-kit';

// interfaces
import { ITraveler, ITravelerList } from '@components/search';

// models
import { TravelerFilter } from '@search/models';

// env
import { environment } from '@environments/environment';

// services
import { TravelerService } from '@search/services/traveler.service';

@Injectable()
export class PrimaryTravelerService implements OnDestroy {

  public travelers$ = new Subject<ITraveler[]>();
  public resetPrimaryTraveler$ = new Subject<void>();

  private _search$ = new Subject<Query<TravelerFilter>>();
  private _destroy$ = new Subject<boolean>();

  constructor(
    private _travelerService: TravelerService,
    private _cdr: ChangeDetectorRef,
  ) {}

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public listenSearch(): void {
    const search$ = this._search$.pipe(
      switchMap((searchFilter) => this._travelerService.getTravelerListWithAddress(searchFilter)),
      takeUntil(this._destroy$),
    );

    search$.subscribe((data: IQueryResult<ITravelerList>) => {
      this.travelers$.next([...data.items]);
      !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
    });
  }

  public listenSearchInput(searchInput: ElementRef): void {
    const excludedKeys = ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'];

    const keyup$ = fromEvent(searchInput.nativeElement, 'keyup')
      .pipe(
        filter((event: KeyboardEvent) => !excludedKeys.includes(event.key)),
        tap(() => this.resetPrimaryTraveler$.next()),
        debounceTime(environment.debounceTime),
        filter((event: KeyboardEvent) => (<HTMLInputElement>event.target).value.length > 2),
        map((event: KeyboardEvent) => (<HTMLInputElement>event.target).value),
        takeUntil(this._destroy$),
      );

    keyup$.subscribe((searchQuery) => this.search(searchQuery));
  }

  public search(pattern?: string): void {
    const searchFilter = this._getFilter(pattern);
    this.travelers$.next([]);
    this._search$.next(searchFilter);

    !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
  }

  public resetPrimaryTraveler(form: FormGroup): void {
    form.get('primaryTraveler').setValue(null);
    this.travelers$.next([]);
  }

  private _getFilter(pattern: string, skip: number = 0): Query<TravelerFilter> {
    return new Query<TravelerFilter>({
      withCount: true,
      skip: skip,
      order: [DEFAULT_TABLE_ORDER],
      filter: new TravelerFilter({
        expressionNameContains: pattern,
        application: Application.AGENT_OFFICE,
      }),
    });
  }

}
