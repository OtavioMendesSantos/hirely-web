import { Directive, input } from '@angular/core';
import { classes, hlm } from '@spartan-ng/helm/utils';
import type { ClassValue } from 'clsx';

@Directive({
  selector: '[hlmSidebarGroup],hlm-sidebar-group',
  host: {
    'data-slot': 'sidebar-group',
    'data-sidebar': 'group',
  },
})
export class HlmSidebarGroup {
  public readonly userClass = input<ClassValue>('', { alias: 'class' });
  constructor() {
    classes(() => hlm('p-2 relative flex w-full min-w-0 flex-col', this.userClass()));
  }
}
