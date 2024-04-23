import { animate, state, style, transition, trigger } from '@angular/animations';

export const ToggleSlideAnimation: any = [
  trigger('toggleSlide', [
    state('void', style({ transform: 'translateX(100%)' })),
    state('enter', style({ transform: 'translateX(0)' })),
    state('leave', style({ transform: 'translateX(100%)' })),
    transition('* => *', animate('120ms linear')),
  ]),
  trigger('toggleSlideDownUp', [
    state('void', style({ transform: 'translateY(100%)' })),
    state('enter', style({ transform: 'translateY(0)' })),
    state('leave', style({ transform: 'translateY(100%)' })),
    transition('* => *', animate('120ms linear')),
  ]),
];
