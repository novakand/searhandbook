import { animate, state, style, transition, trigger } from '@angular/animations';

export const ProfileAnimation: any = [
  trigger('toggleVisibility', [
    state('void', style({ opacity: 0 })),
    state('enter', style({ opacity: 1 })),
    state('leave', style({ opacity: 0 })),
    transition('* => *', animate('120ms')),
  ]),
];
