import { Directive, input } from '@angular/core';
import { classes, hlm } from '@spartan-ng/helm/utils';
import type { ClassValue } from 'clsx';

@Directive({
  selector: '[hlmSidebarFooter],hlm-sidebar-footer',
  host: {
    'data-slot': 'sidebar-footer',
    'data-sidebar': 'footer',
  },
})
export class HlmSidebarFooter {
  public readonly userClass = input<ClassValue>('', { alias: 'class' });
  constructor() {
    classes(() => hlm('gap-2 p-2 flex flex-col', this.userClass()));
  }
}
