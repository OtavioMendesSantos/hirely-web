import { Component, input } from '@angular/core';

@Component({
  selector: 'app-brand',
  standalone: true,
  host: { role: 'img', 'aria-label': 'Hirely' },
  template: `
    <img class="brand-symbol" src="brand/hirely-symbol.svg" alt="" width="100" height="100" />
    @if (!symbolOnly()) {
      <span class="brand-wordmark" aria-hidden="true"></span>
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 0.08em;
      height: 1.8rem;
      flex-shrink: 0;
      color: var(--foreground);
    }
    .brand-symbol {
      height: 100%;
      width: auto;
      flex-shrink: 0;
    }
    .brand-wordmark {
      display: block;
      height: 118%;
      align-self: flex-start;
      aspect-ratio: 239 / 118;
      background: currentColor;
      mask: url('/brand/hirely-irely.svg') center / contain no-repeat;
    }
  `,
})
export class BrandComponent {
  readonly symbolOnly = input(false);
}
