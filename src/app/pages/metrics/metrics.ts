import { DatePipe, DOCUMENT } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ApplicationStatus } from '../../core/models/application.model';
import { APPLICATION_STATUS_PRESENTATION } from '../../core/constants/application-status';
import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideAlertTriangle,
  lucideAward,
  lucideCalendar,
  lucideFileText,
  lucideHourglass,
  lucideMessageSquare,
  lucideTrendingUp,
  lucideXCircle,
  lucideChevronDown,
  lucideArrowUpRight,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmDatePickerImports } from '@spartan-ng/helm/date-picker';
import { HlmEmptyImports } from '@spartan-ng/helm/empty';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexLegend,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { AppLayoutComponent } from '../../core/components/app-layout/app-layout';
import { ApplicationService } from '../../core/services/application';

const METRICS_PERIOD_KEY = 'hirely.metrics.period.v1';
const METRICS_PRESETS = ['7days', '30days', 'thisMonth', 'lastMonth', 'thisYear'] as const;
type MetricsPreset = (typeof METRICS_PRESETS)[number];

export interface ChartOptions {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart: ApexChart;
  xaxis?: ApexXAxis;
  yaxis?: ApexYAxis;
  dataLabels?: ApexDataLabels;
  plotOptions?: ApexPlotOptions;
  colors?: string[];
  labels?: string[];
  legend?: ApexLegend;
  tooltip?: ApexTooltip;
}

@Component({
  selector: 'app-metrics',
  standalone: true,
  imports: [
    AppLayoutComponent,
    RouterLink,
    ...HlmCardImports,
    ...HlmBadgeImports,
    ...HlmDatePickerImports,
    ...HlmEmptyImports,
    ...HlmSkeletonImports,
    ...HlmButtonImports,
    ...HlmDropdownMenuImports,
    NgIcon,
    NgApexchartsModule,
  ],
  providers: [
    DatePipe,
    provideIcons({
      lucideFileText,
      lucideMessageSquare,
      lucideTrendingUp,
      lucideAward,
      lucideAlertTriangle,
      lucideCalendar,
      lucideXCircle,
      lucideHourglass,
      lucideChevronDown,
      lucideArrowUpRight,
    }),
  ],
  templateUrl: './metrics.html',
})
export class Metrics implements OnInit {
  private applicationService = inject(ApplicationService);
  private datePipe = inject(DatePipe);
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly refreshKey = signal(0);
  readonly statusOptions = (
    Object.keys(APPLICATION_STATUS_PRESENTATION) as ApplicationStatus[]
  ).map((value) => ({ value, label: APPLICATION_STATUS_PRESENTATION[value].label }));

  applicationFilters(filters: Record<string, string> = {}) {
    return {
      archive_state: 'all',
      start_date: this.datePipe.transform(this.startDate(), 'yyyy-MM-dd') ?? undefined,
      end_date: this.datePipe.transform(this.endDate(), 'yyyy-MM-dd') ?? undefined,
      ...filters,
    };
  }

  retry() {
    this.refreshKey.update((value) => value + 1);
  }

  openStatus(index: number) {
    const status = this.statusOptions[index]?.value;
    if (!status || this.loading() || this.loadError()) return;
    this.router.navigate(['/applications'], { queryParams: this.applicationFilters({ status }) });
  }

  startDate = signal<Date | null>(null);
  endDate = signal<Date | null>(null);
  selectedPreset = signal<string | null>('Last 30 days');

  dateRangeText = computed(() => {
    const preset = this.selectedPreset();
    if (preset) return preset;

    const start = this.startDate();
    const end = this.endDate();

    if (start && end) {
      return `${this.datePipe.transform(start, 'dd/MM/yyyy')} - ${this.datePipe.transform(end, 'dd/MM/yyyy')}`;
    }
    if (start && !end) {
      return `${this.datePipe.transform(start, 'dd/MM/yyyy')} - Pick end date`;
    }
    return 'Custom Range';
  });

  emptyFormat = () => '';

  onDateChange(dates: [Date | null, Date | null] | null) {
    this.selectedPreset.set(null); // Clear preset if user manually changes dates
    if (dates) {
      this.startDate.set(dates[0]);
      this.endDate.set(dates[1]);
    } else {
      this.startDate.set(null);
      this.endDate.set(null);
    }
    this.savePeriod(null);
  }

  setPreset(preset: MetricsPreset) {
    let today = new Date();
    let start = new Date();

    switch (preset) {
      case '7days':
        start.setDate(today.getDate() - 7);
        this.selectedPreset.set('Last 7 days');
        break;
      case '30days':
        start.setDate(today.getDate() - 30);
        this.selectedPreset.set('Last 30 days');
        break;
      case 'thisMonth':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        this.selectedPreset.set('This Month');
        break;
      case 'lastMonth':
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        today = new Date(today.getFullYear(), today.getMonth(), 0);
        this.selectedPreset.set('Last Month');
        break;
      case 'thisYear':
        start = new Date(today.getFullYear(), 0, 1);
        this.selectedPreset.set('This Year');
        break;
    }

    this.startDate.set(start);
    this.endDate.set(today);
    this.savePeriod(preset);
  }

  private savePeriod(preset: MetricsPreset | null) {
    try {
      this.document.defaultView?.localStorage.setItem(
        METRICS_PERIOD_KEY,
        JSON.stringify({
          version: 1,
          preset,
          start: this.datePipe.transform(this.startDate(), 'yyyy-MM-dd'),
          end: this.datePipe.transform(this.endDate(), 'yyyy-MM-dd'),
        })
      );
    } catch {
      /* Storage may be unavailable; the current selection still works. */
    }
  }

  private restorePeriod(): boolean {
    try {
      const raw = this.document.defaultView?.localStorage.getItem(METRICS_PERIOD_KEY);
      if (!raw) return false;
      const saved = JSON.parse(raw);
      if (!saved || saved.version !== 1) return false;
      if (METRICS_PRESETS.includes(saved.preset)) {
        this.setPreset(saved.preset);
        return true;
      }
      if (saved.preset !== null) return false;
      const parse = (value: unknown): Date | null | undefined => {
        if (value === null) return null;
        if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
        const date = new Date(value + 'T00:00:00');
        return !Number.isNaN(date.getTime()) &&
          this.datePipe.transform(date, 'yyyy-MM-dd') === value
          ? date
          : undefined;
      };
      const start = parse(saved.start),
        end = parse(saved.end);
      if (start === undefined || end === undefined || (start && end && start > end)) return false;
      this.startDate.set(start);
      this.endDate.set(end);
      this.selectedPreset.set(null);
      return true;
    } catch {
      return false;
    }
  }

  stats = this.applicationService.stats;

  hasData = computed(() => {
    const st = this.stats();
    return st ? st.total_applications > 0 : true; // keep true until loaded to prevent flash
  });

  totalApplications = computed(() => this.stats()?.total_applications || 0);

  interviewCount = computed(() => this.stats()?.kpis?.interviews?.count || 0);

  conversionRate = computed(() => {
    const rate = this.stats()?.kpis?.interviews?.rate || 0;
    return (rate * 100).toFixed(1);
  });

  rejectionRate = computed(() => {
    const rate = this.stats()?.kpis?.rejections?.rate || 0;
    return (rate * 100).toFixed(1);
  });

  rejectedCount = computed(() => this.stats()?.kpis?.rejections?.count || 0);

  directRejectionsCount = computed(() => this.stats()?.kpis?.direct_rejections?.count || 0);

  advancedRejectionsCount = computed(() => this.stats()?.kpis?.advanced_rejections?.count || 0);

  ghostedCount = computed(() => this.stats()?.kpis?.ghosting?.count || 0);

  ghostingRate = computed(() => {
    const rate = this.stats()?.kpis?.ghosting?.rate || 0;
    return (rate * 100).toFixed(1);
  });

  funnelChartOptions = computed<ChartOptions | null>(() => {
    const st = this.stats();
    if (!st || !st.funnel_by_status) return null;

    // Ensure logical funnel order instead of alphabetical (Go maps marshal alphabetically)
    const orderedStatuses = [
      'TO_APPLY',
      'APPLIED',
      'INTERVIEW',
      'OFFER',
      'ACCEPTED',
      'REJECTED',
      'OTHER',
    ];

    const statuses = orderedStatuses;
    const counts = orderedStatuses.map(
      (status) => st.funnel_by_status[status as keyof typeof st.funnel_by_status] || 0
    );

    return {
      series: [
        {
          name: 'Applications',
          data: counts,
        },
      ],
      chart: {
        type: 'bar',
        events: {
          dataPointSelection: (_event, _chart, options) =>
            this.openStatus(options?.dataPointIndex ?? -1),
          xAxisLabelClick: (_event, _chart, options) =>
            this.openStatus(options?.['labelIndex'] ?? -1),
          // Apex's keyboard activation emits markerClick with a synthetic event.
          markerClick: (event, _chart, options) => {
            if (!(event instanceof MouseEvent)) this.openStatus(options?.dataPointIndex ?? -1);
          },
        },
        accessibility: {
          enabled: true,
          description:
            'Applications by current status. Select a bar or status to open its applications. Use arrow keys to choose a bar and Enter to open it.',
          keyboard: { enabled: true, navigation: { enabled: true } },
        },
        height: 350,
        toolbar: { show: false },
        fontFamily: 'inherit',
      },
      plotOptions: {
        bar: {
          borderRadius: 6,
          horizontal: true,
          barHeight: '60%',
        },
      },
      dataLabels: {
        enabled: true,
        style: {
          colors: ['#fff'],
        },
      },
      xaxis: {
        categories: statuses,
        labels: {
          style: { cssClass: 'fill-on-surface-variant' },
        },
      },
      yaxis: {
        labels: {
          formatter: (value) => {
            const key = String(value) as ApplicationStatus;
            return APPLICATION_STATUS_PRESENTATION[key]
              ? APPLICATION_STATUS_PRESENTATION[key].label + ' ↗'
              : String(value);
          },
          style: { cssClass: 'fill-on-surface font-semibold cursor-pointer' },
        },
      },
      colors: ['#3b82f6'], // primary blue
      tooltip: {
        theme: 'dark',
      },
    };
  });

  tagsChartOptions = computed<ChartOptions | null>(() => {
    const st = this.stats();
    if (!st || !st.top_tags || st.top_tags.length === 0) return null;

    const tags = st.top_tags.map((t) => t.tag_name);
    const counts = st.top_tags.map((t) => t.count);

    return {
      series: counts,
      chart: {
        type: 'donut',
        height: 350,
        fontFamily: 'inherit',
      },
      labels: tags,
      dataLabels: {
        enabled: true,
      },
      legend: {
        position: 'bottom',
        labels: {
          colors: 'var(--text-on-surface-variant)',
        },
      },
      tooltip: {
        theme: 'dark',
      },
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'],
    };
  });

  jobTitlesChartOptions = computed<ChartOptions | null>(() => {
    const st = this.stats();
    if (!st || !st.top_job_titles || st.top_job_titles.length === 0) return null;

    const titles = st.top_job_titles.map((t) => t.job_title);
    const counts = st.top_job_titles.map((t) => t.count);

    return {
      series: [
        {
          name: 'Applications',
          data: counts,
        },
      ],
      chart: {
        type: 'bar',
        height: 350,
        toolbar: { show: false },
        fontFamily: 'inherit',
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          horizontal: true,
        },
      },
      dataLabels: {
        enabled: true,
      },
      xaxis: {
        categories: titles,
        labels: {
          style: { cssClass: 'fill-on-surface-variant' },
        },
      },
      yaxis: {
        labels: {
          style: { cssClass: 'fill-on-surface font-semibold', fontSize: '11px' },
        },
      },
      colors: ['#10b981'], // emerald
      tooltip: {
        theme: 'dark',
      },
    };
  });

  constructor() {
    effect((onCleanup) => {
      const start = this.startDate();
      const end = this.endDate();
      this.refreshKey();
      const startStr = start
        ? (this.datePipe.transform(start, 'yyyy-MM-dd') ?? undefined)
        : undefined;
      const endStr = end ? (this.datePipe.transform(end, 'yyyy-MM-dd') ?? undefined) : undefined;
      this.loading.set(true);
      this.loadError.set(false);
      const subscription = this.applicationService.loadStats(startStr, endStr)?.subscribe({
        next: () => this.loading.set(false),
        error: () => {
          this.loading.set(false);
          this.loadError.set(true);
        },
      });
      onCleanup(() => subscription?.unsubscribe());
    });
  }

  ngOnInit() {
    if (!this.restorePeriod()) this.setPreset('30days');
  }
}
