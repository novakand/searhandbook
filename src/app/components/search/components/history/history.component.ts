import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewRef } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';

// external libs
import { takeUntil, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';

// inner libs
import { Query } from 'h21-be-ui-kit';

// enums
import { SearchMode as QueryType } from '../../enums';
import { SearchKind } from '@app/enums';

// interfaces
import { ISearchFilter } from '@components/search/interfaces';

// models
import { HistorySearchFilter } from '@components/search/models';

// services
import { HistorySearchService, StorageService } from '@core/services';

@Component({
  selector: 'h21-history',
  templateUrl: './history.component.html',
  styleUrls: [ './history.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryComponent implements OnInit, OnDestroy {

  public tabletMode: boolean;
  public inProgress = true;
  public noProgress = false;
  public noResultText = 'Nothing found';

  public data: ISearchFilter[];

  public queryType = QueryType;
  public searchKind = SearchKind;

  private _destroy$ = new Subject<boolean>();

  constructor(
    private _router: Router,
    private _cdr: ChangeDetectorRef,
    private _storage: StorageService,
    private _service: HistorySearchService,
    private _breakpointObserver: BreakpointObserver,
  ) {
    this._service.current$.next(null);

    this._breakpointObserver.observe(['(max-width: 1100px)'])
      .subscribe((state: BreakpointState) => {
        this.tabletMode = state.matches;
        this._cdr.markForCheck();
      });
  }

  public ngOnInit(): void {
    this._load();
  }

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public trackByFn(index: number): number {
    return index;
  }

  public showQuery(type: QueryType, id: string): void {
    const extras: NavigationExtras = {
      queryParams: {
        restoreById: id,
      },
    };
    this._router.navigate([`/search/${type}`], extras);
  }

  private _load(): void {
    const query = new Query<HistorySearchFilter>({ take: 0x5 });

    const history$ = this._service.postQueryMinimal(query)
      .pipe(
        takeUntil(this._destroy$),
      );
    history$.subscribe({
      next: (items) => {
        this.data = items;

        this.inProgress = false;
        this.noProgress = this.data == null || this.data.length === 0;
        !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
      },
    });
  }

}
