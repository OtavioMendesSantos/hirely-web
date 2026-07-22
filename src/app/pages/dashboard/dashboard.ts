import { Component, effect, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucidePlus,
  lucideBriefcase,
  lucideBuilding,
  lucideMapPin,
  lucideDollarSign,
  lucideClock,
  lucideCalendar,
  lucideEdit,
  lucideMessageSquare,
  lucideRefreshCw,
  lucideCheckCircle,
  lucideFilter,
  lucideArrowUpDown,
  lucideChevronLeft,
  lucideChevronRight,
  lucideRotateCcw,
  lucidePartyPopper,
  lucideSend,
  lucideMoreHorizontal,
} from '@ng-icons/lucide';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports, HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmEmptyImports } from '@spartan-ng/helm/empty';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { AuthService } from '../../core/services/auth';
import { ApplicationService } from '../../core/services/application';
import { AppLayoutComponent } from '../../core/components/app-layout/app-layout';
import { CreateApplicationDialogComponent } from '../../core/components/create-application-dialog/create-application-dialog';
import {
  Application,
  ApplicationEvent,
  ApplicationQueryParams,
  ApplicationStatus,
} from '../../core/models/application.model';
import { KanbanColumnComponent } from './components/kanban-column/kanban-column';

export interface KanbanColumn {
  status: ApplicationStatus;
  title: string;
  badgeCount: number;
  highlight?: boolean;
  badgeClass: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppLayoutComponent,
    ...HlmCardImports,
    ...HlmButtonImports,
    ...HlmDialogImports,
    ...HlmEmptyImports,
    ...HlmSkeletonImports,
    ...HlmSpinnerImports,
    ...HlmDropdownMenuImports,
    NgIcon,
    KanbanColumnComponent,
    DragDropModule,
    CdkScrollable,
  ],
  providers: [
    provideIcons({
      lucidePlus,
      lucideBriefcase,
      lucideBuilding,
      lucideMapPin,
      lucideDollarSign,
      lucideClock,
      lucideCalendar,
      lucideEdit,
      lucideMessageSquare,
      lucideRefreshCw,
      lucideCheckCircle,
      lucideFilter,
      lucideArrowUpDown,
      lucideChevronLeft,
      lucideChevronRight,
      lucideRotateCcw,
      lucidePartyPopper,
      lucideSend,
      lucideMoreHorizontal,
    }),
  ],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialogService = inject(HlmDialogService);
  applicationService = inject(ApplicationService);

  currentUser = this.authService.currentUser;

  readonly selectedStatuses = signal<ApplicationStatus[]>([]);
  readonly sortBy = signal<string>('created_at');
  readonly sortOrder = signal<'asc' | 'desc'>('desc');
  readonly allStatusOptions: { value: ApplicationStatus; label: string }[] = [
    { value: 'TO_APPLY', label: 'To Apply' },
    { value: 'APPLIED', label: 'Applied' },
    { value: 'INTERVIEW', label: 'Interviewing' },
    { value: 'OFFER', label: 'Offer' },
    { value: 'ACCEPTED', label: 'Accepted' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'OTHER', label: 'Other' },
  ];

  readonly sortOptions: { value: string; label: string }[] = [
    { value: 'created_at', label: 'Created Date' },
    { value: 'job_title', label: 'Job Title' },
    { value: 'updated_at', label: 'Last Updated' },
    { value: 'applied_at', label: 'Applied Date' },
  ];

  readonly columns = computed<KanbanColumn[]>(() => {
    const grouped = this.applicationService.groupedApplications();
    const activeFilter = this.selectedStatuses();

    const baseColumns: {
      status: ApplicationStatus;
      title: string;
      highlight?: boolean;
      badgeClass: string;
    }[] = [
      {
        status: 'TO_APPLY',
        title: 'TO APPLY',
        badgeClass: 'bg-primary/10 text-primary border-primary/20',
      },
      {
        status: 'APPLIED',
        title: 'APPLIED',
        badgeClass: 'bg-primary/10 text-primary border-primary/20',
      },
      {
        status: 'INTERVIEW',
        title: 'INTERVIEWING',
        highlight: true,
        badgeClass: 'bg-destructive/10 text-destructive border-destructive/20',
      },
      {
        status: 'OFFER',
        title: 'OFFER',
        badgeClass:
          'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      },
      {
        status: 'ACCEPTED',
        title: 'ACCEPTED',
        badgeClass:
          'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      },
      {
        status: 'REJECTED',
        title: 'REJECTED',
        badgeClass: 'bg-destructive/10 text-destructive border-destructive/20',
      },
      {
        status: 'OTHER',
        title: 'OTHER',
        badgeClass: 'bg-on-surface-variant/10 text-on-surface-variant border-on-surface-variant/20',
      },
    ];

    return baseColumns
      .filter((col) => {
        if (activeFilter.length === 0) {
          return true;
        }
        return activeFilter.includes(col.status);
      })
      .map((col) => ({
        ...col,
        badgeCount: (grouped[col.status] || []).length,
      }));
  });

  constructor() {
    effect(() => {
      if (this.currentUser()) {
        this.loadGrouped();
      }
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['action'] === 'new') {
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { action: null },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
        this.openCreateModal();
      }

      const rawStatus = params['status'];
      const newStatuses = rawStatus
        ? (rawStatus
            .split(',')
            .filter((s: string) =>
              this.allStatusOptions.some((o) => o.value === s)
            ) as ApplicationStatus[])
        : [];
      const newSort = params['sort'] || params['order_by'] || 'created_at';
      const newOrder = params['order'] === 'asc' ? 'asc' : 'desc';

      const statusChanged = JSON.stringify(newStatuses) !== JSON.stringify(this.selectedStatuses());
      const sortChanged = newSort !== this.sortBy();
      const orderChanged = newOrder !== this.sortOrder();

      if (statusChanged || sortChanged || orderChanged) {
        this.selectedStatuses.set(newStatuses);
        this.sortBy.set(newSort);
        this.sortOrder.set(newOrder);
        if (this.currentUser()) {
          this.loadGrouped();
        }
      }
    });
  }

  loadGrouped() {
    const params: ApplicationQueryParams = {};
    const statuses = this.selectedStatuses();
    if (statuses.length > 0) {
      params.status = statuses.join(',');
    }
    if (this.sortBy()) params.order_by = this.sortBy();
    if (this.sortOrder()) params.order = this.sortOrder();

    this.applicationService.loadGroupedApplications(params)?.subscribe();
  }

  toggleStatusFilter(status: ApplicationStatus) {
    const current = this.selectedStatuses();
    const newStatuses = current.includes(status)
      ? current.filter((s) => s !== status)
      : [...current, status];
    this.updateUrlParams(newStatuses, this.sortBy(), this.sortOrder());
  }

  clearStatusFilter() {
    this.updateUrlParams([], this.sortBy(), this.sortOrder());
  }

  onSortByChange(by: string) {
    this.updateUrlParams(this.selectedStatuses(), by, this.sortOrder());
  }

  toggleSortOrder() {
    const newOrder = this.sortOrder() === 'asc' ? 'desc' : 'asc';
    this.updateUrlParams(this.selectedStatuses(), this.sortBy(), newOrder);
  }

  resetAllFilters() {
    this.updateUrlParams([], 'created_at', 'desc');
  }

  private updateUrlParams(statuses: ApplicationStatus[], sort: string, order: 'asc' | 'desc') {
    const queryParams: Record<string, string | null> = {
      status: statuses.length > 0 ? statuses.join(',') : null,
      sort: sort !== 'created_at' ? sort : null,
      order: order !== 'desc' ? order : null,
    };
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  getCardsForStatus(status: ApplicationStatus): Application[] {
    return this.applicationService.groupedApplications()[status] || [];
  }

  openCreateModal(initialStatus?: ApplicationStatus) {
    this.dialogService.open(CreateApplicationDialogComponent, {
      contentClass:
        'sm:max-w-xl max-h-[90vh] flex flex-col overflow-hidden bg-surface-container-lowest border border-border-subtle shadow-2xl rounded-2xl',
      context: initialStatus ? { initialStatus } : undefined,
    });
  }

  openEditModal(application: Application, event?: Event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.dialogService.open(CreateApplicationDialogComponent, {
      contentClass:
        'sm:max-w-xl max-h-[90vh] flex flex-col overflow-hidden bg-surface-container-lowest border border-border-subtle shadow-2xl rounded-2xl',
      context: { application },
    });
  }

  onApplicationDrop(event: CdkDragDrop<Application[]>) {
    if (
      event.previousContainer === event.container ||
      event.previousContainer.id === event.container.id
    ) {
      if (event.previousIndex !== event.currentIndex) {
        const status = event.container.id as ApplicationStatus;
        const currentGrouped = { ...this.applicationService.groupedApplications() };
        const targetList = [...(currentGrouped[status] || [])];
        moveItemInArray(targetList, event.previousIndex, event.currentIndex);
        this.applicationService.groupedApplications.set({
          ...currentGrouped,
          [status]: targetList,
        });
      }
      return;
    }

    const previousStatus = event.previousContainer.id as ApplicationStatus;
    const newStatus = event.container.id as ApplicationStatus;
    const app = event.item.data as Application;

    if (!app || previousStatus === newStatus) return;

    const oldGrouped = { ...this.applicationService.groupedApplications() };
    const oldApps = [...this.applicationService.applications()];

    const optimisticallyUpdated: Application = {
      ...app,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    const updatedGrouped = { ...oldGrouped };
    const sourceList = [...(updatedGrouped[previousStatus] || [])];
    const destList = [...(updatedGrouped[newStatus] || [])];

    const sourceIndex = sourceList.findIndex((item) => item.id === app.id);
    if (sourceIndex !== -1) {
      sourceList.splice(sourceIndex, 1);
    } else {
      const filtered = sourceList.filter((item) => item.id !== app.id);
      sourceList.length = 0;
      sourceList.push(...filtered);
    }

    destList.splice(event.currentIndex, 0, optimisticallyUpdated);

    updatedGrouped[previousStatus] = sourceList;
    updatedGrouped[newStatus] = destList;

    this.applicationService.groupedApplications.set(updatedGrouped);
    this.applicationService.applications.set(
      oldApps.map((item) => (item.id === app.id ? optimisticallyUpdated : item))
    );

    this.applicationService.updateApplication(app.id, { status: newStatus }).subscribe({
      next: () => {},
      error: (err) => {
        console.error('Failed to update application status:', err);
        this.applicationService.groupedApplications.set(oldGrouped);
        this.applicationService.applications.set(oldApps);
      },
    });
  }
}
