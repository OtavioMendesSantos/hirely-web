import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer
      class="bg-surface border-border-subtle text-on-surface-variant relative z-10 mt-auto flex w-full flex-col items-center justify-between gap-4 border-t px-6 py-8 text-sm sm:flex-row sm:px-12 md:px-20"
    >
      <div class="font-heading text-primary text-xl font-bold">Hirely</div>
      <div class="text-center font-medium sm:text-right">
        Hirely {{ currentYear }}, developed by
        <a
          href="https://otavio.is-a.dev/"
          target="_blank"
          rel="noopener noreferrer"
          class="text-primary font-semibold hover:underline"
          >@OtavioMendesSantos</a
        >
      </div>
    </footer>
  `,
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
