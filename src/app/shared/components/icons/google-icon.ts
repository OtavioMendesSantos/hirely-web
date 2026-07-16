import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-google-icon',
  standalone: true,
  template: `
    <svg [class]="class" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"/>
      <path fill="#34A853" d="M12 24c3.3 0 6.08-1.09 8.11-2.96l-3.88-3.05c-1.1.74-2.5 1.18-4.23 1.18-3.26 0-6.02-2.2-7.01-5.17H1.01v3.15C3.06 21.3 7.23 24 12 24Z"/>
      <path fill="#FBBC05" d="M4.99 14c-.25-.74-.39-1.54-.39-2.36s.14-1.62.39-2.36V6.13H1.01C.37 7.42 0 8.89 0 10.36s.37 2.94 1.01 4.23l3.98-3.15Z"/>
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.96 1.19 15.18 0 12 0 7.23 0 3.06 2.7 1.01 6.85l3.98 3.15c.99-2.97 3.75-5.17 7.01-5.17Z"/>
    </svg>
  `,
})
export class GoogleIconComponent {
  @Input() class = 'w-4 h-4';
}
