import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'h21-three-line-preloader',
  templateUrl: 'three-line-preloader.component.html',
  styleUrls: ['three-line-preloader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThreeLinePreloaderComponent {

  @Input() public message: string;

}
