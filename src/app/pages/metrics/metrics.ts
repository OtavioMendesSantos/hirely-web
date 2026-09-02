import { DatePipe } from '@angular/common';
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
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
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

export interface ChartOptions {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart: ApexChart;
  xaxis?: ApexXAxis | any;
  yaxis?: ApexYAxis | any;
  dataLabels?: ApexDataLabels | any;
  plotOptions?: ApexPlotOptions | any;
  colors?: string[] | any;
  labels?: string[] | any;
  legend?: ApexLegend | any;
  tooltip?: ApexTooltip | any;
}

@Component({
  selector: 'app-metrics',
  standalone: true,
  imports: [
    AppLayoutComponent,
    ...HlmCardImports,
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
      lucideChevronDown
    }),
  ],
  templateUrl: './metrics.html',
})
export class Metrics implements OnInit {
  private applicationService = inject(ApplicationService);
  private datePipe = inject(DatePipe);

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
  }

  setPreset(preset: '7days' | '30days' | 'thisMonth' | 'lastMonth' | 'thisYear') {
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
          style: { cssClass: 'fill-on-surface font-semibold' },
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
    effect(() => {
      const start = this.startDate();
      const end = this.endDate();

      const startStr = start
        ? (this.datePipe.transform(start, 'yyyy-MM-dd') ?? undefined)
        : undefined;
      const endStr = end ? (this.datePipe.transform(end, 'yyyy-MM-dd') ?? undefined) : undefined;

      this.applicationService.loadStats(startStr, endStr)?.subscribe();
    });
  }

  ngOnInit() {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    this.startDate.set(thirtyDaysAgo);
    this.endDate.set(today);
  }
}
