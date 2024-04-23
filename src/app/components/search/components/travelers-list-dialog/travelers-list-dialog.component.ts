import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  OnDestroy,
  ViewChild,
  ViewRef
} from '@angular/core';

// external libs
import { Subject } from 'rxjs';

// inner libs
import { DIALOG_PANEL_DATA, IH21DialogPanel, ViewMode } from 'h21-be-ui-kit';

// environment
import { ToggleSlideAnimation } from '@animation/toggle-slide';
import { ToggleVisibilityAnimation } from '@animation/toggle-visibility';

// enums
import { AnimationState } from '@app/enums/animation-state';

// models
import { ITraveler } from '../../interfaces/traveler.interface';

@Component({
  selector: 'h21-travelers-list-dialog',
  templateUrl: './travelers-list-dialog.component.html',
  animations: [
    ToggleSlideAnimation,
    ToggleVisibilityAnimation,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TravelersListDialogComponent implements OnDestroy, AfterViewInit {

  public animationState: AnimationState;
  public animationStateChanged = new EventEmitter<AnimationEvent>();

  public title: string;
  public mode: ViewMode;
  public data: ITraveler[];

  public viewModeType = ViewMode;
  public inProgress = false;

  private _focusedItem: ITraveler;
  private _destroy$ = new Subject<boolean>();

  @ViewChild('container') private _container: ElementRef;

  constructor(private _cdr: ChangeDetectorRef,
              @Inject(DIALOG_PANEL_DATA) private _dialogPanel: IH21DialogPanel,
  ) {
    this.data = _dialogPanel.data.travelers;
    this.mode = _dialogPanel.data.mode != null ? _dialogPanel.data.mode : ViewMode.View;
    this.title = _dialogPanel.data.mode === ViewMode.View ? 'Travellers' : 'Delete traveller';
  }

  public ngAfterViewInit() {
    this._container.nativeElement.focus();
  }

  public ngOnDestroy(): void {
    this.close();
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public remove(traveler: ITraveler): void {
    const index = this.data.findIndex((t) => t.id === traveler.id);
    this.data.splice(index, 1);
    !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
  }

  public trackByFn(index) {
    return index;
  }

  public inFocus(traveler: ITraveler): boolean {
    return this._focusedItem != null && this._focusedItem.id === traveler.id;
  }

  public clearFocus(): void {
    this._focusedItem = null;
  }

  public focus(traveler: ITraveler): void {
    if (this._focusedItem == null || this._focusedItem.id !== traveler.id) {
      this._focusedItem = traveler;
      !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
    }
  }

  public onAnimation(event: AnimationEvent): void {
    this.animationStateChanged.emit(event);
  }

  public close(): void {
    this._dialogPanel.data.overlay.detach();
  }

}
