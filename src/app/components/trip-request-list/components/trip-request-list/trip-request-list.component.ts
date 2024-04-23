import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild, ViewRef,
} from '@angular/core';

import { MatDialog, MatPaginator, MatTableDataSource } from '@angular/material';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  H21ColumnsSelectRef,
  H21ColumnsSelectService,
  H21DialogPanelService,
  IColumn,
  IH21DialogPanel,
  LoadProgressService,
  ToolbarActionsService,
} from 'h21-be-ui-kit';

import { TripRequestFilterComponent } from '../trip-request-filter';
import { TripRequestDialogComponent } from '../trip-request-dialog';

import { TripRequestFilter } from '../../models';
import { ITripRequestListItem } from '../../interfaces';

import { columnsConst } from '../../constants';

@Component({
  selector: 'h21-trip-request-list',
  templateUrl: './trip-request-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TripRequestListComponent implements OnDestroy, OnInit {

  public dataSource: MatTableDataSource<ITripRequestListItem>;
  public pageSize = 10;
  public totalCount: number;
  public displayedColumns: string[];

  public actionInProgress = true;
  public loadInProgress = true;
  public noProgress = false;

  @ViewChild(MatPaginator) private _paginator: MatPaginator;

  private _columns: IColumn[];
  private _columnsSelectDialogRef: H21ColumnsSelectRef;
  private _filter: TripRequestFilter;
  private _destroy$ = new Subject<boolean>();

  constructor(private _dialog: MatDialog,
              private _cdr: ChangeDetectorRef,
              private _loadProgressService: LoadProgressService,
              private _dialogPanelService: H21DialogPanelService,
              private _toolbarActionsService: ToolbarActionsService,
              private _columnsSelectDialog: H21ColumnsSelectService,
  ) {
    this._init();
  }

  public ngOnInit() {
    this._submitRequest();
    this._setToolbarActions();
  }

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public trackByFn(index: number): number {
    return index;
  }

  public checkFilter(): boolean {
    return !!Object.keys(this._filter).find((value) => {
      if (Array.isArray(this._filter[value])) {
        return this._filter[value] && this._filter[value].length;
      }
      return !!this._filter[value];
    });
  }

  public openFilter(): void {
    const panelData: IH21DialogPanel = {
      data: {
        filter: this._filter,
      },
    };

    panelData.data.overlay = this._dialogPanelService.open(TripRequestFilterComponent, panelData);

    panelData.data.overlay.detachments()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: () => {
          if (this._paginator) {
            this._paginator.firstPage();
          } else {
            this.loadInProgress = true;
            this.noProgress = false;
          }
          this._filter = panelData.data.filter;
          !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
          this._submitRequest();
          this._setToolbarActions();
        },
      });
  }

  public openColumnsSelect() {
    this._columnsSelectDialogRef = this._columnsSelectDialog.open(this._columns);
    this._columnsSelectDialogRef.afterClosed$
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (data) => {
          if (data) {
            this._columns = data;
            this._setDisplayedColumns();
            !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
          }
        },
      });
  }

  public openRequest(id: number): void {
    const selection = window.getSelection();
    if (selection.toString().length === 0) {
      // action
    }
  }

  public openEditDialog(tr: ITripRequestListItem): void {
    const dialogRef = this._dialog.open(TripRequestDialogComponent, {
      data: tr,
      disableClose: true,
      minWidth: '400px',
      maxWidth: '600px',
      backdropClass: 'h21-message-dialog_backdrop',
      panelClass: 'h21-message-dialog_panel',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this._submitRequest();
      }
    });
  }

  private _init() {
    this._filter = new TripRequestFilter();
    this._columns = columnsConst;
    this._setDisplayedColumns();
  }

  private _submitRequest(): void {
    this._loadProgressService.show(1);
    this.noProgress = false;

    setTimeout(() => {
      const data = this._getTestData();
      this._setDataSource(data);
      this.totalCount = data.length;

      this.loadInProgress = false;
      this._loadProgressService.hide(1);
      this.noProgress = this.totalCount === 0;
      !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
    }, 2000);
  }

  private _setDataSource(items: ITripRequestListItem[]): void {
    if (this.dataSource) {
      this.dataSource.connect().next(items);
    } else {
      this.dataSource = new MatTableDataSource<ITripRequestListItem>(items);
      this.dataSource.paginator = this._paginator;
    }
    !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
  }

  private _setDisplayedColumns(): void {
    this.displayedColumns = [];
    this._columns.forEach((item) => {
      item.displayed && this.displayedColumns.push(item.name);
    });
  }

  private _setToolbarActions(): void {
    this._toolbarActionsService.actions$.next([
      {
        name: 'filter',
        disabled: false,
        tooltipText: 'Open filter',
        icon: 'filter_list',
        cssClass: this.checkFilter()
          ? 'h21-header-toolbar_action-button__is-marked'
          : '',
        action: () => this.openFilter(),
        visible: true,
      },
      {
        name: 'setDisplayedColumns',
        disabled: false,
        tooltipText: 'Select displayed columns',
        icon: 'view_week',
        action: () => this.openColumnsSelect(),
        visible: true,
      },
      {
        name: 'help',
        disabled: false,
        tooltipText: 'Help',
        icon: 'help',
        action: () => { },
        visible: true,
      },
    ]);
  }

  private _getTestData(): ITripRequestListItem[] {
    const requests = [];
    const request = {
      id: 0,
      name: 'Test request',
      departure: 'London, United Kingdom',
      arrival: 'Milan, Italy',
      city: 'Milan, Italy',
      pickUp: 'London, United Kingdom',
      dropDown: 'Milan, Italy',
      from: 'London, United Kingdom',
      to: 'Milan, Italy',
      dateOfCreation: '01.01.2019',
      travelersCount: 2,
      sharedState: 1,
      air: true,
      transfer: true,
      hotel: true,
      train: true,
    };
    for (let i = 0; i < 20; i++) {
      requests.push({ ...request });
      requests[i].id = i + 5;
    }
    return requests;
  }

}
