import { Component, EventEmitter, Output } from '@angular/core';
import { GoogleIconComponent } from '../../../../shared/components/icons/google-icon';
import { LinkedinIconComponent } from '../../../../shared/components/icons/linkedin-icon';
import { HlmButtonImports } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-social-auth-buttons',
  standalone: true,
  imports: [GoogleIconComponent, LinkedinIconComponent, ...HlmButtonImports],
  template: `
    <div class="flex items-center gap-4 my-7">
      <div class="h-px flex-1 bg-border-subtle"></div>
      <span class="text-xs font-medium text-on-surface-variant uppercase tracking-wider">Or continue with</span>
      <div class="h-px flex-1 bg-border-subtle"></div>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <button
        hlmBtn
        variant="outline"
        type="button"
        (click)="socialClick.emit('Google')"
        class="w-full h-10 px-4 rounded bg-surface-container-lowest hover:bg-surface-muted text-on-surface text-sm font-medium flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
      >
        <app-google-icon class="w-4 h-4" />
        <span>Google</span>
      </button>

      <button
        hlmBtn
        variant="outline"
        type="button"
        (click)="socialClick.emit('LinkedIn')"
        class="w-full h-10 px-4 rounded bg-surface-container-lowest hover:bg-surface-muted text-on-surface text-sm font-medium flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
      >
        <app-linkedin-icon class="w-4 h-4" />
        <span>LinkedIn</span>
      </button>
    </div>
  `,
})
export class SocialAuthButtonsComponent {
  @Output() socialClick = new EventEmitter<string>();
}
