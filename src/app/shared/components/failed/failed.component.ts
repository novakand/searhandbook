import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'h21-failed',
  templateUrl: 'failed.component.html',
  styleUrls: [ 'failed.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FailedComponent {

  @Input() public link: string[];
  @Input() public queryParams: Record<string, string>;
  @Input() public btnTitle: string;

}
