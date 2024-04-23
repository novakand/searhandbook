import { animate, state, style, transition, trigger } from '@angular/animations';

import { AnimationState } from '../enums/animation-state';

export const ToggleMatExpansionAnimation: any =
    trigger('toggleMatExpansion', [
        state(`${AnimationState.Collapsed}, ${AnimationState.Void}`,
            style({
                height: '0px',
                overflow: 'hidden',
                visibility: 'hidden',
                opacity: 0,
            })),
        state(AnimationState.Expanded,
            style({
                height: '*',
                overflow: 'visible',
                visibility: 'visible',
                opacity: 1,
            })),
        transition('expanded <=> collapsed',
            animate('225ms cubic-bezier(0.4,0.0,0.2,1)')),
    ]);
