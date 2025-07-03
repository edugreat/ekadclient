
import { Directive, ElementRef, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MathJaxService } from '../services/math-jax.service';


@Directive({
  selector: '[appMathJax]',
  standalone: true
})
export class MathJaxDirective implements OnChanges {
  @Input() appMathJax: string = '';

  private el = inject(ElementRef);
  private mathJaxService = inject(MathJaxService);

  constructor(
    
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appMathJax']) {
      this.renderMath();
    }
  }

  private renderMath(): void {
    this.el.nativeElement.innerHTML = this.appMathJax;
    this.mathJaxService.typeset(this.el.nativeElement)
      .catch(err => console.error('MathJax typeset failed:', err));
  }
}