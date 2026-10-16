import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, OnInit, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArchive,
  lucideArchiveRestore,
  lucideBriefcase,
  lucideBriefcaseBusiness,
  lucideBuilding,
  lucideCalendar,
  lucideCheckCircle,
  lucideCopy,
  lucideDollarSign,
  lucideEdit,
  lucideExternalLink,
  lucideFileText,
  lucideLink,
  lucideLoader2,
  lucideMapPin,
  lucideMessageSquare,
  lucidePlus,
  lucideRefreshCw,
  lucideTrash2,
} from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { toast } from '@spartan-ng/brain/sonner';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { MarkdownComponent } from 'ngx-markdown';
import { DeleteConfirmationComponent } from '../../../shared/components/delete-confirmation/delete-confirmation';
import { Application, ApplicationEvent } from '../../models/application.model';
import { ApplicationService } from '../../services/application';
import { CreateApplicationDialogComponent } from '../create-application-dialog/create-application-dialog';

@Component({
  selector: 'app-application-detail-content',
  standalone: true,
  imports: [
    CommonModule,
    DeleteConfirmationComponent,
    FormsModule,
    ...HlmCardImports,
    ...HlmButtonImports,
    ...HlmInputImports,
    ...HlmAlertDialogImports,
    ...HlmSkeletonImports,
    ...HlmSpinnerImports,
    NgIcon,
    MarkdownComponent,
  ],
  providers: [
    provideIcons({
      lucideArchive,
      lucideArchiveRestore,
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
      lucideCopy,
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
  readonly deleting = signal(false);
  readonly deleteError = signal<string | null>(null);
  readonly archivePending = signal(false);
  readonly eventToDelete = signal<ApplicationEvent | null>(null);
  readonly deletingEvent = signal(false);
  readonly eventDeleteError = signal<string | null>(null);

  showAllEvents = signal<boolean>(false);
  showFullNotes = signal<boolean>(false);
  showFullJobDescription = signal<boolean>(false);

  isLongNotes = computed(() => {
    const text = this.application()?.notes || '';
    return text.length > 1000 || text.split('\n').length > 15;
  });

  isLongJobDescription = computed(() => {
    const text = this.application()?.jobDescription || '';
    return text.length > 800 || text.split('\n').length > 15;
  });

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
        const msg =
          err.error?.error?.message ||
          err.error?.message ||
          'Failed to load job application details.';
        this.errorMessage.set(msg);
        toast.error(msg);
      },
    });
  }

  openEditDialog() {
    const app = this.application();
    if (!app || app.archivedAt) return;

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
    this.deleteError.set(null);
    this.isDeleteConfirmOpen.set(true);
  }

  onDeleteDialogStateChanged(state: 'open' | 'closed') {
    if (state === 'closed') {
      this.isDeleteConfirmOpen.set(false);
    }
  }

  cancelDelete() {
    if (!this.deleting()) this.isDeleteConfirmOpen.set(false);
  }

  confirmDelete() {
    const app = this.application();
    if (!app || this.deleting()) return;
    this.deleting.set(true);
    this.deleteError.set(null);

    this.applicationService.deleteApplication(app.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.isDeleteConfirmOpen.set(false);
        toast.success('Application deleted');
        this.applicationDeleted.emit();
        if (this.isModal() || this.dialogRef) {
          this.dialogRef?.close({ deleted: true });
        } else {
          this.router.navigate([app.archivedAt ? '/archived' : '/dashboard']);
        }
      },
      error: (err) => {
        const msg =
          err.error?.error?.message || err.error?.message || 'Failed to delete application';
        this.deleting.set(false);
        this.deleteError.set(msg);
      },
    });
  }

  toggleArchive() {
    const app = this.application();
    if (!app || this.archivePending()) return;
    this.archivePending.set(true);
    const request = app.archivedAt
      ? this.applicationService.restoreApplication(app.id)
      : this.applicationService.archiveApplication(app.id);
    request.subscribe({
      next: (updated) => {
        this.archivePending.set(false);
        this.application.set(updated);
        this.applicationLoaded.emit(updated);
        toast.success(app.archivedAt ? 'Application restored' : 'Application archived');
      },
      error: () => {
        this.archivePending.set(false);
        toast.error("Couldn't update the application. Try again.");
      },
    });
  }

  addNote() {
    const app = this.application();
    const text = this.newNoteText().trim();
    if (!app || app.archivedAt || !text || this.isAddingNote()) return;

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

  askDeleteEvent(event: ApplicationEvent) {
    this.eventDeleteError.set(null);
    this.eventToDelete.set(event);
  }

  confirmDeleteEvent() {
    const application = this.application();
    const event = this.eventToDelete();
    if (!application || !event || this.deletingEvent()) return;
    this.deletingEvent.set(true);
    this.eventDeleteError.set(null);
    this.applicationService.deleteEvent(application.id, event.id).subscribe({
      next: () => {
        this.deletingEvent.set(false);
        this.eventToDelete.set(null);
        this.application.update((current) =>
          current
            ? {
                ...current,
                events: current.events?.filter((item) => item.id !== event.id),
              }
            : current
        );
        toast.success('Event deleted');
        // Reload canonical activity time and any other affected application fields.
        this.loadApplication();
      },
      error: () => {
        this.deletingEvent.set(false);
        this.eventDeleteError.set("Couldn't delete the event. Try again.");
      },
    });
  }

  getEventIcon(event: ApplicationEvent): string {
    if (event.action === 'ARCHIVED') return 'lucideArchive';
    if (event.action === 'UNARCHIVED') return 'lucideArchiveRestore';
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
    if (event.action === 'ARCHIVED') return 'Application archived';
    if (event.action === 'UNARCHIVED') return 'Application restored';
    if (event.type === 'MANUAL') return 'Note Added';
    if (event.previousStatus && event.newStatus) return 'Stage Changed';
    if (event.description.toLowerCase().includes('created')) return 'Application Submitted';
    return 'System Event';
  }

  copyToClipboard(text: string, label: string) {
    if (!text) return;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success(`${label} copied to clipboard`);
      })
      .catch(() => {
        toast.error('Failed to copy');
      });
  }
}
