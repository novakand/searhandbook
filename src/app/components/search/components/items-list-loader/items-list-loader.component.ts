import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { Observable, range } from 'rxjs';
import { toArray } from 'rxjs/operators';

@Component({
  selector: 'h21-items-list-loader',
  templateUrl: './items-list-loader.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemsListLoaderComponent {

  @Input() public small = false;
  @Input() public showToolbar = false;
  @Input() public showNoResult = false;
  @Input() public noResultText = 'Nothing found';

  public counts$: Observable<number[]> = range(0x1, 0x3).pipe(toArray());

  public trackByFn(index: number): number {
    return index;
  }

}
