import { animate, state, style, transition, trigger } from '@angular/animations';
import { AnimationState } from '@app/enums/animation-state';

export const TravelerFilterAnimation: any = [
  trigger('toggleSlide', [
    state(AnimationState.Void, style({ transform: 'translateX(100%)' })),
    state(AnimationState.Enter, style({ transform: 'translateX(0)' })),
    state(AnimationState.Leave, style({ transform: 'translateX(100%)' })),
    transition('* => *', animate('120ms linear')),
  ]),
];
