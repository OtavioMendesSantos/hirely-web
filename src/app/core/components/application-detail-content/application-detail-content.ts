import { Component, computed, effect, inject, input, OnInit, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBriefcase,
      lucideBriefcaseBusiness,
  lucideBuilding,
  lucideMapPin,
  lucideDollarSign,
  lucideLink,
  lucideCalendar,
  lucideFileText,
  lucidePlus,
  lucideEdit,
  lucideTrash2,
  lucideExternalLink,
  lucideMessageSquare,
  lucideRefreshCw,
  lucideCheckCircle,
  lucideLoader2,
} from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { toast } from '@spartan-ng/brain/sonner';
import { ApplicationService } from '../../services/application';
import { Application, ApplicationEvent } from '../../models/application.model';
import { CreateApplicationDialogComponent } from '../create-application-dialog/create-application-dialog';

@Component({
  selector: 'app-application-detail-content',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ...HlmCardImports,
    ...HlmButtonImports,
    ...HlmInputImports,
    ...HlmAlertDialogImports,
    ...HlmSkeletonImports,
    ...HlmSpinnerImports,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideBriefcase,
      lucideBriefcaseBusiness,
      lucideBuilding,
      lucideMapPin,
      lucideDollarSign,
      lucideLink,
      lucideCalendar,
      lucideFileText,
      lucidePlus,
      lucideEdit,
      lucideTrash2,
      lucideExternalLink,
      lucideMessageSquare,
      lucideRefreshCw,
      lucideCheckCircle,
      lucideLoader2,
    }),
  ],
  templateUrl: './application-detail-content.html',
})
export class ApplicationDetailContentComponent implements OnInit {
  private applicationService = inject(ApplicationService);
  private dialogService = inject(HlmDialogService);
  private router = inject(Router);
  dialogRef = inject(BrnDialogRef, { optional: true });
  private readonly _dialogContext = injectBrnDialogContext<{
    applicationId?: string;
    application?: Application;
  } | null>({
    optional: true,
  });

  readonly applicationId = input<string>();
  readonly isModal = input<boolean>(false);

  readonly applicationLoaded = output<Application>();
  readonly applicationDeleted = output<void>();

  application = signal<Application | null>(null);
  loading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  newNoteText = signal<string>('');
  isAddingNote = signal<boolean>(false);
  isDeleteConfirmOpen = signal<boolean>(false);

  showAllEvents = signal<boolean>(false);
  showFullNotes = signal<boolean>(false);
  showFullJobDescription = signal<boolean>(false);

  sortedEvents = computed(() => {
    const events = this.application()?.events;
    if (!events) return [];
    return [...events].reverse();
  });

  constructor() {
    effect(() => {
      const id =
        this.applicationId() ||
        this._dialogContext?.applicationId ||
        this._dialogContext?.application?.id;
      if (id) {
        this.loadApplication(id);
      }
    });
  }

  ngOnInit() {
    if (this._dialogContext?.application) {
      this.application.set(this._dialogContext.application);
      this.loading.set(false);
    }
  }

  loadApplication(id?: string) {
    const targetId =
      id ||
      this.applicationId() ||
      this._dialogContext?.applicationId ||
      this._dialogContext?.application?.id ||
      this.application()?.id;
    if (!targetId) return;

    this.loading.set(true);
    this.errorMessage.set(null);

    this.applicationService.getApplication(targetId).subscribe({
      next: (app) => {
        this.application.set(app);
        this.loading.set(false);
        this.applicationLoaded.emit(app);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(
          err.error?.error?.message ||
            err.error?.message ||
            'Failed to load job application details.'
        );
      },
    });
  }

  openEditDialog() {
    const app = this.application();
    if (!app) return;

    const dialogRef = this.dialogService.open(CreateApplicationDialogComponent, {
      contentClass:
        'sm:max-w-xl max-h-[90vh] flex flex-col overflow-hidden bg-surface-container-lowest border border-border-subtle shadow-2xl rounded-2xl',
      context: { application: app },
    });

    dialogRef.closed$.subscribe((updatedApp) => {
      if (updatedApp) {
        toast.success('Application updated successfully');
        this.loadApplication();
      }
    });
  }

  openDeleteConfirm() {
    this.isDeleteConfirmOpen.set(true);
  }

  onDeleteDialogStateChanged(state: 'open' | 'closed') {
    if (state === 'closed') {
      this.isDeleteConfirmOpen.set(false);
    }
  }

  cancelDelete() {
    this.isDeleteConfirmOpen.set(false);
  }

  confirmDelete() {
    const app = this.application();
    if (!app) return;

    this.applicationService.deleteApplication(app.id).subscribe({
      next: () => {
        toast.success('Application deleted successfully');
        this.applicationDeleted.emit();
        if (this.isModal() || this.dialogRef) {
          this.dialogRef?.close({ deleted: true });
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        const msg =
          err.error?.error?.message || err.error?.message || 'Failed to delete application';
        toast.error(msg);
      },
    });
  }

  addNote() {
    const app = this.application();
    const text = this.newNoteText().trim();
    if (!app || !text || this.isAddingNote()) return;

    this.isAddingNote.set(true);
    this.applicationService.addEvent(app.id, text).subscribe({
      next: () => {
        toast.success('Note added to timeline');
        this.newNoteText.set('');
        this.isAddingNote.set(false);
        this.loadApplication();
      },
      error: (err) => {
        this.isAddingNote.set(false);
        const msg = err.error?.error?.message || err.error?.message || 'Failed to add note';
        toast.error(msg);
      },
    });
  }

  getEventIcon(event: ApplicationEvent): string {
    if (event.type === 'MANUAL') return 'lucideMessageSquare';
    if (
      event.description.toLowerCase().includes('status') ||
      event.previousStatus ||
      event.newStatus
    ) {
      return 'lucideRefreshCw';
    }
    return 'lucideCheckCircle';
  }

  getEventTitle(event: ApplicationEvent): string {
    if (event.type === 'MANUAL') return 'Note Added';
    if (event.previousStatus && event.newStatus) return 'Stage Changed';
    if (event.description.toLowerCase().includes('created')) return 'Application Submitted';
    return 'System Event';
  }
}
