import { Directive, input } from '@angular/core';
import { classes, hlm } from '@spartan-ng/helm/utils';
import type { ClassValue } from 'clsx';

@Directive({
  selector: '[hlmSidebarContent],hlm-sidebar-content',
  host: {
    'data-slot': 'sidebar-content',
    'data-sidebar': 'content',
  },
})
export class HlmSidebarContent {
  public readonly userClass = input<ClassValue>('', { alias: 'class' });
  constructor() {
    classes(() =>
      hlm(
        'no-scrollbar gap-0 flex min-h-0 flex-1 flex-col overflow-auto group-data-[collapsible=icon]:overflow-hidden',
        this.userClass()
      )
    );
  }
}
