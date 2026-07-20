import { Directive, input } from '@angular/core';
import { classes, hlm } from '@spartan-ng/helm/utils';
import type { ClassValue } from 'clsx';

@Directive({
  selector: '[hlmSidebarHeader],hlm-sidebar-header',
  host: {
    'data-slot': 'sidebar-header',
    'data-sidebar': 'header',
  },
})
export class HlmSidebarHeader {
  public readonly userClass = input<ClassValue>('', { alias: 'class' });
  constructor() {
    classes(() => hlm('gap-2 p-2 flex flex-col', this.userClass()));
  }
}
