import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'h21-data-loading-indicator',
  templateUrl: './data-loading-indicator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataLoadingIndicatorComponent {

  @Input() public loaded: number;
  @Input() public totalCount: number;

  constructor() {
    this.loaded = 0;
    this.totalCount = 0;
  }

}
