import { Component, EventEmitter, Output, Input } from '@angular/core';
import { GoogleIconComponent } from '../../../../shared/components/icons/google-icon';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';

@Component({
  selector: 'app-social-auth-buttons',
  standalone: true,
  imports: [GoogleIconComponent, ...HlmButtonImports, ...HlmSpinnerImports],
  template: `
    <div class="my-7 flex items-center gap-4">
      <div class="bg-border-subtle h-px flex-1"></div>
      <span class="text-on-surface-variant text-xs font-medium tracking-wider uppercase"
        >Or continue with</span
      >
      <div class="bg-border-subtle h-px flex-1"></div>
    </div>

    <div class="flex flex-col gap-2.5 sm:gap-3">
      <button
        hlmBtn
        variant="outline"
        type="button"
        [disabled]="isGoogleLoading"
        (click)="socialClick.emit('Google')"
        class="bg-surface-container-lowest hover:bg-surface-muted text-on-surface flex h-10 w-full cursor-pointer items-center justify-center gap-1.5 rounded px-2 text-xs font-medium transition-colors sm:gap-2.5 sm:px-4 sm:text-sm"
      >
        @if (isGoogleLoading) {
          <hlm-spinner class="h-4 w-4 shrink-0" />
        } @else {
          <app-google-icon class="h-4 w-4 shrink-0" />
        }
        <span class="truncate">Google</span>
      </button>
    </div>
  `,
})
export class SocialAuthButtonsComponent {
  @Input() isGoogleLoading = false;
  @Output() socialClick = new EventEmitter<string>();
}
