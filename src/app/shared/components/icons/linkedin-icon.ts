import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-linkedin-icon',
  standalone: true,
  template: `
    <svg [class]="class" viewBox="0 0 24 24" class="fill-[#0A66C2]" aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v7.6H9.2v-7.6H6.46M7.83 6.35a1.68 1.68 0 0 0-1.68 1.68c0 .93.75 1.68 1.68 1.68a1.69 1.69 0 0 0 1.69-1.68c0-.93-.76-1.68-1.69-1.68Z"/>
    </svg>
  `,
})
export class LinkedinIconComponent {
  @Input() class = 'w-4 h-4';
}
