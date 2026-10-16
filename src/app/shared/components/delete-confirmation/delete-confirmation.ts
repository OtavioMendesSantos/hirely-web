import { Component, input, output } from '@angular/core';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';

@Component({
  selector: 'app-delete-confirmation',
  imports: [...HlmAlertDialogImports, ...HlmSpinnerImports],
  template: `
    <hlm-alert-dialog [state]="open() ? 'open' : 'closed'" (stateChanged)="onStateChanged($event)">
      <hlm-alert-dialog-content *hlmAlertDialogPortal>
        <hlm-alert-dialog-header>
          <h2 hlmAlertDialogTitle>{{ title() }}</h2>
          <p hlmAlertDialogDescription>{{ description() }}</p>
        </hlm-alert-dialog-header>
        @if (error()) {
          <p class="text-destructive text-sm" role="alert">{{ error() }}</p>
        }
        <hlm-alert-dialog-footer>
          <button hlmAlertDialogCancel [disabled]="pending()" (click)="cancelled.emit()">
            Cancel
          </button>
          <button
            hlmAlertDialogAction
            variant="destructive"
            [disabled]="pending()"
            (click)="confirmed.emit()"
          >
            @if (pending()) {
              <hlm-spinner />
            }
            {{ pending() ? 'Deleting…' : 'Delete' }}
          </button>
        </hlm-alert-dialog-footer>
      </hlm-alert-dialog-content>
    </hlm-alert-dialog>
  `,
})
export class DeleteConfirmationComponent {
  readonly open = input(false);
  readonly pending = input(false);
  readonly error = input<string | null>(null);
  readonly title = input('Delete application?');
  readonly description = input(
    'This permanently deletes the application, its notes, and its history.'
  );
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  onStateChanged(state: 'open' | 'closed') {
    if (state === 'closed' && !this.pending()) this.cancelled.emit();
  }
}
