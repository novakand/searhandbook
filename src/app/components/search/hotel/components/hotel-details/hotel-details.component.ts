import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
} from '@angular/core';

import { MatTabGroup } from '@angular/material';

// interfaces
import { IHotelSearchResultItem, IRoomListBatch } from '@hotel/interfaces';

// services
import { HotelDetailsService } from '@hotel/services';

@Component({
  selector: 'h21-hotel-details',
  templateUrl: './hotel-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HotelDetailsService],
})
export class HotelDetailsComponent implements AfterViewInit, OnDestroy, OnInit {

  @Input() public selectedTab = 0;
  @Input() public batchId: string;
  @Input() public data: IHotelSearchResultItem;
  @Input() public items: IHotelSearchResultItem[];
  @Output() public emitData: EventEmitter<IRoomListBatch> = new EventEmitter<IRoomListBatch>();
  @Output() public hideDetails: EventEmitter<void> = new EventEmitter<void>();

  private _tabHeaderFixed = false;
  private _matTabHeaderRef: any;
  private _hideRoomsBtnRef: any;
  private _roomsCount: number;

  @ViewChild(MatTabGroup, { read: ElementRef }) private _matTabGroupRef: ElementRef;
  @ViewChild('hideRoomsBtn', { read: ElementRef }) private _hideRoomsBtn: ElementRef;

  constructor (
    private _thisRef: ElementRef,
    private _renderer2: Renderer2,
  ) { }

  public onSelectedIndexChange(index: number): void {
    this.selectedTab = index;
    if (this.selectedTab !== 0 && this._tabHeaderFixed) {
      this._unFixTabsHeader();
      this._matTabGroupRef.nativeElement.scrollIntoView(true);
    }
  }

  public ngOnInit(): void {
    window.addEventListener('scroll', this.scroll, true);
    window.addEventListener('resize', this.resize, true);
  }

  public ngAfterViewInit(): void {
    this._matTabHeaderRef = document.querySelector(`.${this._thisRef.nativeElement.classList[0]} .mat-tab-header`);
    this._hideRoomsBtnRef = this._hideRoomsBtn.nativeElement;
  }

  public ngOnDestroy(): void {
    window.removeEventListener('scroll', this.scroll, true);
    window.removeEventListener('resize', this.resize, true);
  }

  public resize = (): void => this._tabHeaderFixed && this._fixTabsHeader();
  public scroll = (): void => this.selectedTab === 0 && this._roomsCount > 5 && this._fixTabsHeader();

  public exitSending(data: IRoomListBatch): void {
    this._roomsCount = data.list.length;
    !this._roomsCount && this._unFixTabsHeader();
    this.emitData.emit(data);
  }

  public hide(): void {
    this.hideDetails.emit();
  }

  private _fixTabsHeader(): void {
    const headerLeftOffset = this._calculateTabHeaderLeftOffset();
    const scrollTop = document.querySelector('.c-hotel-search-result').scrollTop;
    const offsetTop = this._matTabGroupRef.nativeElement.offsetTop;
    const tabHeaderHeight = this._matTabHeaderRef.offsetHeight;
    const tabGroupHeight = this._matTabGroupRef.nativeElement.offsetHeight;
    const tabGroupWidth = this._matTabGroupRef.nativeElement.offsetWidth - 1;

    if ((offsetTop - scrollTop) < 0 && (<number>offsetTop + <number>tabGroupHeight) > scrollTop) {
      this._renderer2.setStyle(this._matTabGroupRef.nativeElement, 'padding-top', `${tabHeaderHeight}px`);
      this._renderer2.setStyle(this._matTabHeaderRef, 'width', `${tabGroupWidth}px`);
      this._renderer2.setStyle(this._matTabHeaderRef, 'left', `${headerLeftOffset}px`);
      this._renderer2.addClass(this._matTabHeaderRef, 'c-hotel-details_fix-mat-tab-header');
      this._renderer2.setStyle(this._hideRoomsBtnRef, 'left', `${headerLeftOffset + tabGroupWidth - 44}px`);
      this._renderer2.addClass(this._hideRoomsBtnRef, 'c-hotel-details_fixed-close-btn__is-active');

      if ((<number>offsetTop + <number>tabGroupHeight - scrollTop) <= tabHeaderHeight) {
        this._renderer2.addClass(this._matTabHeaderRef, 'c-hotel-details_fix-mat-tab-header__to-bottom');
        this._renderer2.removeClass(this._hideRoomsBtnRef, 'c-hotel-details_fixed-close-btn__is-active');
      } else {
        this._renderer2.removeClass(this._matTabHeaderRef, 'c-hotel-details_fix-mat-tab-header__to-bottom');
        this._renderer2.addClass(this._hideRoomsBtnRef, 'c-hotel-details_fixed-close-btn__is-active');
      }

      this._tabHeaderFixed = true;
    } else {
      this._unFixTabsHeader();
    }
  }

  private _unFixTabsHeader(): void {
    this._renderer2.setStyle(this._matTabGroupRef.nativeElement, 'padding-top', '0');
    this._renderer2.setStyle(this._matTabHeaderRef, 'left', '0');
    this._renderer2.removeClass(this._matTabHeaderRef, 'c-hotel-details_fix-mat-tab-header');
    this._renderer2.setStyle(this._hideRoomsBtnRef, 'left', '0');
    this._renderer2.removeClass(this._hideRoomsBtnRef, 'c-hotel-details_fixed-close-btn__is-active');
    this._renderer2.removeClass(this._matTabHeaderRef, 'c-hotel-details_fix-mat-tab-header__to-bottom');
    this._tabHeaderFixed = false;
  }

  private _calculateTabHeaderLeftOffset(): number {
    let el = this._matTabGroupRef.nativeElement;
    let offset = 0;
    while (el.offsetParent) {
      offset += el.offsetLeft;
      el = el.offsetParent;
    }
    return offset;
  }

}
