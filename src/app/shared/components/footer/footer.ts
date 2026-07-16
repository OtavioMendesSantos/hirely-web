import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="bg-surface w-full px-6 sm:px-12 md:px-20 py-8 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-border-subtle mt-auto z-10 relative text-sm text-on-surface-variant">
      <div class="text-xl font-heading font-bold text-primary">
        Hirely
      </div>
      <div class="font-medium text-center sm:text-right">
        Hirely {{ currentYear }}, developed by
        <a href="https://otavio.is-a.dev/" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-semibold">@OtavioMendesSantos</a>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
