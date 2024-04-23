import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewRef,
} from '@angular/core';

import { Subject } from 'rxjs';

import {
  LoadProgressService,
  ToolbarActionsService,
  ViewMode,
} from 'h21-be-ui-kit';

import { AdditionalReference } from '../../models';

@Component({
  selector: 'h21-references',
  templateUrl: './references.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReferencesComponent implements OnDestroy, OnInit {

  public inProgress = true;

  public additionalReferences: AdditionalReference[];
  public valueMaxLength: number;

  public formFieldAppearance: string;
  public mode: ViewMode;
  public modeType = ViewMode;

  private _destroy$ = new Subject<boolean>();

  constructor(private _cdr: ChangeDetectorRef,
              private _loadProgressService: LoadProgressService,
              private _toolbarActionsService: ToolbarActionsService,
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

  public addPosible(): boolean {
    return this.mode === ViewMode.Edit && this.additionalReferences.length < 6;
  }

  public add(): void {
    if (this.additionalReferences.length > 6) {
      return;
    }
    this.additionalReferences.push(new AdditionalReference());
    !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
  }

  public edit(): void {
    this.mode = ViewMode.Edit;
    !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
    this._setToolbarActions();
  }

  public save(): void {
    this.mode = ViewMode.View;
    !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
    this._setToolbarActions();
  }

  public cancel(): void {
    this.mode = ViewMode.View;
    !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
    this._setToolbarActions();
  }

  public delete(i: number): void {
    this.additionalReferences.splice(i, 1);
    !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
  }

  private _init() {
    this.formFieldAppearance = 'outline';
    this.additionalReferences = [];
    this.valueMaxLength = 13;
    this.mode = ViewMode.View;
  }

  private _submitRequest(): void {
    this._loadProgressService.show(1);

    setTimeout(() => {
      this.inProgress = false;
      this._loadProgressService.hide(1);
      !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
    }, 2000);
  }

  private _setToolbarActions(): void {
    this._toolbarActionsService.actions$.next([
      {
        name: 'save',
        disabled: false,
        tooltipText: 'Save',
        icon: 'save',
        action: () => this.save(),
        visible: this.mode === ViewMode.Edit,
      },
      {
        name: 'cancel',
        disabled: false,
        tooltipText: 'Cancel',
        icon: 'undo',
        action: () => this.cancel(),
        visible: this.mode === ViewMode.Edit,
      },
      {
        name: 'edit',
        disabled: false,
        tooltipText: 'Edit',
        icon: 'edit',
        action: () => this.edit(),
        visible: this.mode === ViewMode.View,
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

}
