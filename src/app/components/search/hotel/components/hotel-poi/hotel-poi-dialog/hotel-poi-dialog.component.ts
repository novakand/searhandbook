import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material';

// external libs
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

// inner libs
import { DIALOG_PANEL_DATA, IH21DialogPanel, PanelAction, ViewMode } from 'h21-be-ui-kit';

// environment
import { ToggleSlideAnimation } from '@animation/toggle-slide';

// enums
import { AnimationState } from '@app/enums/animation-state';

// services
import { PoiService } from '../poi.service';

@Component({
  selector: 'h21-hotel-poi-dialog',
  templateUrl: './hotel-poi-dialog.component.html',
  styleUrls: [ './hotel-poi-dialog.component.scss' ],
  animations: [ ToggleSlideAnimation ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PoiService],
})
export class HotelPoiDialogComponent implements AfterViewInit, OnDestroy, OnInit {

  public animationState: AnimationState;
  public animationStateChanged = new EventEmitter<AnimationEvent>();

  public formFieldAppearance = 'outline';
  public separatorKeysCodes: number[] = [ ENTER, COMMA, SPACE ];
  public viewModeTypes = ViewMode;

  public title: string;
  public inProgress: boolean;
  public action = PanelAction;

  public data = this._dialogPanel.data.poi;
  public mode = this._dialogPanel.data.mode;
  public poiImages = this._dialogPanel.data.poiImages;

  public form: FormGroup;
  public tagList: string[];

  private _destroy$ = new Subject<boolean>();

  @ViewChild('container') private _container: ElementRef;

  constructor(
    private _fb: FormBuilder,
    private _cdr: ChangeDetectorRef,
    private _poiService: PoiService,
    @Inject(DIALOG_PANEL_DATA) private _dialogPanel: IH21DialogPanel,
  ) {
    this.title = this.mode === ViewMode.Add ? 'Add POI' : 'Edit POI';
    this._buildForm();
  }

  public ngOnInit(): void {
    this.form.patchValue(this.data);
    this._setTagList();
  }

  public ngAfterViewInit() {
    this._container.nativeElement.focus();
  }

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public trackByFn(index: number): number {
    return index;
  }

  public removeTag(i: number): void {
    this.tagList.splice(i, 1);
  }

  public addTag($event: MatChipInputEvent): void {
    const i = this.tagList.findIndex((e) => e === $event.value);
    if (i === -1 && $event.value) {
      this.tagList.push($event.value.substring(0, 45));
      $event.input.value = '';
    }
  }

  public onSubmit(): void {
    this.form.valid && this._send();
  }

  public close(type: PanelAction = PanelAction.SAVE): void {
    this._dialogPanel.data.action = type;
    this._dialogPanel.data.overlay.detach();
  }

  public onAnimation(event: AnimationEvent): void {
    this.animationStateChanged.emit(event);
  }

  private _send(): void {
    this.inProgress = true;
    this.form.disable();

    this.form.get('tags').setValue(this.tagList.join(','));
    this.form.get('arrayTags').setValue(this.tagList);

    const save$ = this._poiService.save(this.form.value).pipe(takeUntil(this._destroy$));
    save$.subscribe(() => {
      this.inProgress = false;
      this.close();
    });
  }

  private _setTagList(): void {
    this.tagList = this.data.arrayTags ? this.data.arrayTags : [];
  }

  private _buildForm(): void {
    this.form = this._fb.group({
      name: new FormControl(null, Validators.compose([Validators.required, Validators.maxLength(50)])),
      comment: new FormControl(null, Validators.maxLength(100)),
      tags: new FormControl(),
      arrayTags: new FormControl(),
      description: new FormControl(),
      location: new FormControl(),
      image: new FormControl(),
      profileId: new FormControl(),
      id: new FormControl(),
    });
  }

}
