import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appClickHighlight]',
  standalone: true
})
export class ClickHighlightDirective {
  @Input() highlightColor: string = 'black';
  @Input() textColor: string = 'white';

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('click') onClick() {
    this.renderer.setStyle(this.el.nativeElement, 'backgroundColor', this.highlightColor);
    this.renderer.setStyle(this.el.nativeElement, 'color', this.textColor);
    // redondearlo
    this.renderer.setStyle(this.el.nativeElement, 'borderRadius', '10px');

  }
}