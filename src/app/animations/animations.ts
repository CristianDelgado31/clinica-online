import { trigger, transition, style, query, group, animate } from '@angular/animations';

  export const fadeAndSlideAnimation = 
  trigger('fadeAndSlideAnimations', [
    transition('* <=> *', [
      style({ position: 'relative' }),
      query(':enter, :leave', [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          opacity: 0 // Empieza invisible
        })
      ], { optional: true }),
      query(':enter', [
        style({ transform: 'translateX(100%)' }) // Entra desde la derecha
      ], { optional: true }),
      group([
        query(':leave', [
          animate('1500ms ease', style({ opacity: 0, transform: 'translateX(-100%)' })) // Sale hacia la izquierda
        ], { optional: true }),
        query(':enter', [
          animate('1500ms ease', style({ opacity: 1, transform: 'translateX(0)' })) // Entra desde la derecha
        ], { optional: true })
      ])
    ])
  ]);