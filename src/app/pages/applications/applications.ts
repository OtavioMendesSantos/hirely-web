import { CommonModule, DOCUMENT, ViewportScroller } from '@angular/common';
import {
  afterNextRender,
  Component,
  DestroyRef,
  Injector,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBriefcaseBusiness, lucideFilter, lucideX } from '@ng-icons/lucide';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmEmptyImports } from '@spartan-ng/helm/empty';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmNativeSelectImports } from '@spartan-ng/helm/native-select';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { AppLayoutComponent } from '../../core/components/app-layout/app-layout';
import { APPLICATION_STATUS_PRESENTATION } from '../../core/constants/application-status';
import {
  Application,
  ApplicationMetric,
  ApplicationQueryParams,
  ApplicationStatus,
} from '../../core/models/application.model';
import { ApplicationService } from '../../core/services/application';
import { AuthService } from '../../core/services/auth';

const METRIC_DESCRIPTION: Record<ApplicationMetric, string> = {
  interviews:
    'Reached interviews: includes applications currently interviewing or beyond, and applications with a recorded interview, offer, or acceptance.',
  rejections: 'Rejected applications.',
  direct_rejections:
    'Direct rejections: rejected applications without a recorded interview or offer.',
  advanced_rejections:
    'Rejections after advancing: rejected applications with a recorded interview or offer.',
  ghosting: 'No response: applications still marked Applied with no activity for at least 30 days.',
};

@Component({
  selector: 'app-applications',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    AppLayoutComponent,
    NgIcon,
    ...HlmBadgeImports,
    ...HlmButtonImports,
    ...HlmCardImports,
    ...HlmDropdownMenuImports,
    ...HlmEmptyImports,
    ...HlmFieldImports,
    ...HlmInputImports,
    ...HlmNativeSelectImports,
    ...HlmSkeletonImports,
    ...HlmTableImports,
  ],
  providers: [provideIcons({ lucideBriefcaseBusiness, lucideFilter, lucideX })],
  templateUrl: './applications.html',
})
export class Applications {
  private readonly service = inject(ApplicationService);
  private readonly document = inject(DOCUMENT);
  private readonly viewport = inject(ViewportScroller);
  private readonly injector = inject(Injector);
  private pendingScrollRestore: [number, number] | null = null;
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchChanges = new Subject<string>();
  private generation = 0;
  private accountId = this.auth.currentUser()?.id ?? null;
  private lastParams: ParamMap | null = null;
  private filterKey = '';
  readonly applications = signal<Application[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly total = signal<number | null>(null);
  readonly search = signal('');
  readonly statuses = signal<ApplicationStatus[]>([]);
  readonly startDate = signal('');
  readonly endDate = signal('');
  readonly archiveState = signal<'active' | 'archived' | 'all'>('all');
  readonly sortBy = signal('created_at');
  readonly order = signal<'asc' | 'desc'>('desc');
  readonly metric = signal<ApplicationMetric | null>(null);
  readonly metricDescription = computed(() =>
    this.metric() ? METRIC_DESCRIPTION[this.metric()!] : ''
  );
  readonly dateError = signal<string | null>(null);
  readonly cursors = signal<(string | undefined)[]>([undefined]);
  readonly nextToken = signal<string | undefined>(undefined);
  readonly statusPresentation = APPLICATION_STATUS_PRESENTATION;
  readonly statusOptions = (
    Object.keys(APPLICATION_STATUS_PRESENTATION) as ApplicationStatus[]
  ).map((value) => ({ value, label: APPLICATION_STATUS_PRESENTATION[value].label }));
  readonly selectedStatusLabels = computed(() =>
    this.statusOptions
      .filter((option) => this.statuses().includes(option.value))
      .map((option) => option.label)
      .join(', ')
  );
  readonly sortOptions = [
    { value: 'created_at', label: 'Created date' },
    { value: 'updated_at', label: 'Last activity' },
    { value: 'applied_at', label: 'Applied date' },
    { value: 'job_title', label: 'Job title' },
    { value: 'archived_at', label: 'Archived date' },
  ];
  readonly hasFilters = computed(
    () =>
      !!(
        this.search() ||
        this.statuses().length ||
        this.startDate() ||
        this.endDate() ||
        this.metric() ||
        this.archiveState() !== 'all'
      )
  );

  constructor() {
    this.destroyRef.onDestroy(() => this.generation++);
    effect(() => {
      const accountId = this.auth.currentUser()?.id ?? null;
      untracked(() => {
        if (accountId === this.accountId) return;
        this.accountId = accountId;
        this.generation++;
        this.pendingScrollRestore = null;
        this.applications.set([]);
        this.total.set(null);
        this.nextToken.set(undefined);
        this.cursors.set([undefined]);
        this.loading.set(false);
        this.error.set(null);
        // A cursor belongs to an account; remove it before reading with another account.
        if (accountId && this.lastParams?.get('page_token'))
          this.navigate({ page_token: null }, true);
        else if (accountId) this.load();
      });
    });
    this.route.queryParamMap
      .pipe(takeUntilDestroyed())
      .subscribe((params) => this.readParams(params));
    this.searchChanges
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((value) => this.updateFilters({ search: value.trim() || null }));
  }

  private readParams(params: ParamMap) {
    this.lastParams = params;
    this.search.set(params.get('search') || '');
    this.statuses.set(
      (params.get('status') || '')
        .split(',')
        .filter((value) => Object.hasOwn(this.statusPresentation, value)) as ApplicationStatus[]
    );
    this.startDate.set(params.get('start_date') || '');
    this.endDate.set(params.get('end_date') || '');
    const archiveState = params.get('archive_state');
    this.archiveState.set(
      archiveState === 'active' || archiveState === 'archived' ? archiveState : 'all'
    );
    const sort = params.get('order_by') || 'created_at';
    this.sortBy.set(this.sortOptions.some((option) => option.value === sort) ? sort : 'created_at');
    this.order.set(params.get('order') === 'asc' ? 'asc' : 'desc');
    const metric = params.get('metric');
    this.metric.set(
      metric && Object.hasOwn(METRIC_DESCRIPTION, metric) ? (metric as ApplicationMetric) : null
    );
    const nextFilterKey = JSON.stringify(this.query(false));
    const token = params.get('page_token') || undefined;
    const state =
      this.router.currentNavigation()?.extras.state ??
      (typeof history !== 'undefined' ? history.state : null);
    const saved = state?.['applicationListCursors'];
    const position = state?.['applicationListScroll'];
    this.pendingScrollRestore =
      this.router.currentNavigation()?.trigger === 'popstate' &&
      state?.['applicationListAccount'] === this.accountId &&
      state?.['applicationListFilters'] === nextFilterKey &&
      Array.isArray(position) &&
      position.length === 2 &&
      position.every((value) => typeof value === 'number' && Number.isFinite(value))
        ? (position as [number, number])
        : null;
    if (
      Array.isArray(saved) &&
      saved.length &&
      saved.every((item) => item == null || typeof item === 'string') &&
      state?.['applicationListAccount'] === this.accountId &&
      state?.['applicationListFilters'] === nextFilterKey &&
      (saved.at(-1) || undefined) === token
    ) {
      this.cursors.set(saved.map((item) => item || undefined));
    } else if (this.filterKey !== nextFilterKey || this.cursors().at(-1) !== token) {
      this.cursors.set(token ? [undefined, token] : [undefined]);
    }
    this.filterKey = nextFilterKey;
    this.load();
  }

  private query(withCursor = true): ApplicationQueryParams {
    return {
      archive_state: this.archiveState(),
      search: this.search().trim() || undefined,
      status: this.statuses().join(',') || undefined,
      metric: this.metric() || undefined,
      start_date: this.startDate() || undefined,
      end_date: this.endDate() || undefined,
      order_by: this.sortBy(),
      order: this.order(),
      page_size: 20,
      ...(withCursor ? { page_token: this.cursors().at(-1) } : {}),
    };
  }

  load() {
    const accountId = this.auth.currentUser()?.id;
    if (!accountId) return;
    const generation = ++this.generation;
    this.dateError.set(this.validateDates(this.startDate(), this.endDate()));
    this.error.set(null);
    if (this.dateError()) {
      this.loading.set(false);
      this.applications.set([]);
      this.total.set(null);
      return;
    }
    this.loading.set(true);
    this.service
      .queryApplications(this.query())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (generation !== this.generation || accountId !== this.auth.currentUser()?.id) return;
          this.applications.set(response.applications || []);
          this.total.set(response.total_count ?? null);
          this.nextToken.set(response.next_page_token || undefined);
          this.loading.set(false);
          const position = this.pendingScrollRestore;
          this.pendingScrollRestore = null;
          if (position)
            afterNextRender(
              () => {
                if (generation === this.generation && accountId === this.auth.currentUser()?.id) {
                  this.viewport.scrollToPosition(position, { behavior: 'instant' });
                }
              },
              { injector: this.injector }
            );
        },
        error: () => {
          if (generation !== this.generation || accountId !== this.auth.currentUser()?.id) return;
          this.loading.set(false);
          this.error.set("Couldn't load applications. Try again.");
        },
      });
  }

  onSearchChange(value: string) {
    this.searchChanges.next(value);
  }

  updateFilters(values: Record<string, string | null>) {
    const current: Record<string, string | null> = {
      search: this.search().trim() || null,
      status: this.statuses().join(',') || null,
      archive_state: this.archiveState(),
      start_date: this.startDate() || null,
      end_date: this.endDate() || null,
      metric: this.metric(),
      order_by: this.sortBy(),
      order: this.order(),
    };
    if (!Object.entries(values).some(([key, value]) => current[key] !== value)) return;
    this.generation++;
    this.navigate({ ...values, page_token: null }, true);
  }

  toggleStatus(status: ApplicationStatus) {
    const next = this.statuses().includes(status)
      ? this.statuses().filter((value) => value !== status)
      : [...this.statuses(), status];
    this.updateFilters({ status: next.join(',') || null });
  }

  clearFilters() {
    this.searchChanges.next('');
    this.updateFilters({
      search: null,
      status: null,
      start_date: null,
      end_date: null,
      archive_state: 'all',
      metric: null,
    });
  }

  next() {
    const token = this.nextToken();
    if (!token || this.loading() || this.error() || this.dateError()) return;
    this.cursors.update((values) => [...values, token]);
    this.navigate({ page_token: token });
  }

  previous() {
    if (this.loading() || this.cursors().length === 1) return;
    this.cursors.update((values) => values.slice(0, -1));
    this.navigate({ page_token: this.cursors().at(-1) || null });
  }

  rememberPosition() {
    const window = this.document.defaultView;
    if (!window) return;
    window.history.replaceState(
      {
        ...window.history.state,
        applicationListCursors: this.cursors(),
        applicationListAccount: this.accountId,
        applicationListFilters: this.filterKey,
        applicationListScroll: this.viewport.getScrollPosition(),
      },
      ''
    );
  }

  private navigate(params: Record<string, string | null>, replace = false) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge',
      replaceUrl: replace,
      state: {
        applicationListCursors: replace ? [null] : this.cursors(),
        applicationListAccount: this.accountId,
        applicationListFilters: this.filterKey,
      },
    });
  }

  private validateDates(start: string, end: string): string | null {
    const valid = (value: string) =>
      !value ||
      (/^\d{4}-\d{2}-\d{2}$/.test(value) &&
        !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) &&
        new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value);
    if (!valid(start) || !valid(end)) return 'Enter valid dates in YYYY-MM-DD format.';
    if (start && end && start > end) return 'The end date must be on or after the start date.';
    return null;
  }
}
