import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { toast } from '@spartan-ng/brain/sonner';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmEmptyImports } from '@spartan-ng/helm/empty';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmNativeSelectImports } from '@spartan-ng/helm/native-select';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArchive, lucideTrash2, lucideFilter } from '@ng-icons/lucide';
import { AppLayoutComponent } from '../../core/components/app-layout/app-layout';
import { Application, ApplicationStatus } from '../../core/models/application.model';
import { ApplicationService } from '../../core/services/application';
import { DeleteConfirmationComponent } from '../../shared/components/delete-confirmation/delete-confirmation';

@Component({
  selector: 'app-archived',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    AppLayoutComponent,
    DeleteConfirmationComponent,
    ...HlmButtonImports,
    ...HlmCardImports,
    ...HlmDropdownMenuImports,
    ...HlmEmptyImports,
    ...HlmInputImports,
    ...HlmNativeSelectImports,
    ...HlmSkeletonImports,
    ...HlmBadgeImports,
    NgIcon,
  ],
  providers: [provideIcons({ lucideArchive, lucideTrash2, lucideFilter })],
  templateUrl: './archived.html',
})
export class Archived {
  private readonly service = inject(ApplicationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly searchChanges = new Subject<string>();
  private generation = 0;
  readonly applications = signal<Application[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly search = signal('');
  readonly statuses = signal<ApplicationStatus[]>([]);
  readonly order = signal<'asc' | 'desc'>('desc');
  readonly cursors = signal<(string | undefined)[]>([undefined]);
  readonly nextToken = signal<string | undefined>(undefined);
  readonly restoring = signal<string | null>(null);
  readonly deleteTarget = signal<Application | null>(null);
  readonly deleting = signal(false);
  readonly deleteError = signal<string | null>(null);
  readonly statusOptions: { value: ApplicationStatus; label: string }[] = [
    { value: 'TO_APPLY', label: 'To Apply' },
    { value: 'APPLIED', label: 'Applied' },
    { value: 'INTERVIEW', label: 'Interviewing' },
    { value: 'OFFER', label: 'Offer' },
    { value: 'ACCEPTED', label: 'Accepted' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'OTHER', label: 'Other' },
  ];

  constructor() {
    this.destroyRef.onDestroy(() => this.generation++);
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.search.set(params.get('search') || '');
      this.statuses.set(
        (params.get('status') || '')
          .split(',')
          .filter((value) =>
            this.statusOptions.some((option) => option.value === value)
          ) as ApplicationStatus[]
      );
      this.order.set(params.get('order') === 'asc' ? 'asc' : 'desc');
      this.reload();
    });
    this.searchChanges
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((search) => this.updateFilters({ search: search.trim() || null }));
  }

  onSearchChange(value: string) {
    this.searchChanges.next(value);
  }

  updateFilters(params: Record<string, string | null>) {
    // Invalidate pending results as soon as a filter changes.
    this.generation++;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  toggleStatus(status: ApplicationStatus) {
    const values = this.statuses().includes(status)
      ? this.statuses().filter((value) => value !== status)
      : [...this.statuses(), status];
    this.updateFilters({ status: values.join(',') || null });
  }

  reload() {
    this.cursors.set([undefined]);
    this.load();
  }

  load() {
    const generation = ++this.generation;
    this.loading.set(true);
    this.error.set(null);
    this.service
      .queryApplications({
        archive_state: 'archived',
        page_size: 20,
        page_token: this.cursors().at(-1),
        search: this.search().trim() || undefined,
        status: this.statuses().join(',') || undefined,
        order_by: 'archived_at',
        order: this.order(),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (generation !== this.generation) return;
          this.applications.set(response.applications || []);
          this.nextToken.set(response.next_page_token || undefined);
          this.loading.set(false);
        },
        error: () => {
          if (generation !== this.generation) return;
          this.error.set("Couldn't load archived applications. Try again.");
          this.loading.set(false);
        },
      });
  }

  next() {
    const token = this.nextToken();
    if (!token || this.loading()) return;
    this.cursors.update((tokens) => [...tokens, token]);
    this.load();
  }

  previous() {
    if (this.cursors().length <= 1 || this.loading()) return;
    this.cursors.update((tokens) => tokens.slice(0, -1));
    this.load();
  }

  restore(application: Application) {
    if (this.restoring()) return;
    this.restoring.set(application.id);
    this.service
      .restoreApplication(application.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.restoring.set(null);
          toast.success('Application restored');
          this.reload();
        },
        error: () => {
          this.restoring.set(null);
          toast.error("Couldn't restore the application. Try again.");
        },
      });
  }

  askDelete(application: Application) {
    this.deleteError.set(null);
    this.deleteTarget.set(application);
  }

  confirmDelete() {
    const target = this.deleteTarget();
    if (!target || this.deleting()) return;
    this.deleting.set(true);
    this.deleteError.set(null);
    this.service
      .deleteApplication(target.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.deleting.set(false);
          this.deleteTarget.set(null);
          toast.success('Application deleted');
          this.reload();
        },
        error: () => {
          this.deleting.set(false);
          this.deleteError.set("Couldn't delete the application. Try again.");
        },
      });
  }
}
