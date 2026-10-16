import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';
import { Subject, tap } from 'rxjs';
import { ApplicationService } from '../../core/services/application';
import { ApplicationStatsResponse } from '../../core/models/application.model';
import { Metrics } from './metrics';

const stats: ApplicationStatsResponse = {
  total_applications: 100,
  funnel_by_status: {
    TO_APPLY: 10,
    APPLIED: 30,
    INTERVIEW: 20,
    OFFER: 5,
    ACCEPTED: 5,
    REJECTED: 25,
    OTHER: 5,
  },
  kpis: {
    interviews: { count: 40, rate: 0.4 },
    rejections: { count: 25, rate: 0.25 },
    direct_rejections: { count: 10, rate: 0.1 },
    advanced_rejections: { count: 15, rate: 0.15 },
    ghosting: { count: 5, rate: 0.05 },
  },
};

describe('Metrics drill-down navigation', () => {
  let component: Metrics;
  let fixture: ComponentFixture<Metrics>;
  const requests: Subject<ApplicationStatsResponse>[] = [];
  const service = {
    stats: signal<ApplicationStatsResponse | null>(null),
    loadStats: vi.fn(() => {
      const request = new Subject<ApplicationStatsResponse>();
      requests.push(request);
      return request.pipe(tap((response) => service.stats.set(response)));
    }),
    queryApplications: vi.fn(),
  };

  beforeEach(async () => {
    vi.restoreAllMocks();
    const values = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => values.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => values.set(key, value)),
      removeItem: vi.fn((key: string) => values.delete(key)),
    });
    requests.length = 0;
    service.stats.set(null);
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [Metrics],
      providers: [provideRouter([]), { provide: ApplicationService, useValue: service }],
    })
      .overrideComponent(Metrics, { set: { template: '' } })
      .compileComponents();
    fixture = TestBed.createComponent(Metrics);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => vi.unstubAllGlobals());

  it('passes actual calendar dates and metric criteria without fetching a list early', async () => {
    component.startDate.set(new Date(2026, 0, 1));
    component.endDate.set(new Date(2026, 9, 16));
    await fixture.whenStable();
    expect(component.applicationFilters({ metric: 'interviews' })).toEqual({
      archive_state: 'all',
      start_date: '2026-01-01',
      end_date: '2026-10-16',
      metric: 'interviews',
    });
    expect(service.loadStats).toHaveBeenLastCalledWith('2026-01-01', '2026-10-16');
    expect(service.queryApplications).not.toHaveBeenCalled();
  });

  it('links chart bars by current status rather than historical metric membership', () => {
    requests.at(-1)!.next(stats);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    component.openStatus(2);
    expect(navigate).toHaveBeenCalledWith(['/applications'], {
      queryParams: { ...component.applicationFilters(), status: 'INTERVIEW' },
    });
    expect(navigate.mock.calls[0][1]?.queryParams).not.toHaveProperty('metric');
    component.openStatus(-1);
    expect(navigate).toHaveBeenCalledTimes(1);
  });

  it('cancels stale stats so a changed period cannot link from old numbers', async () => {
    const old = requests.at(-1)!;
    component.setPreset('thisYear');
    await fixture.whenStable();
    old.next(stats);
    expect(service.stats()).toBeNull();
    expect(component.loading()).toBe(true);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    component.openStatus(2);
    expect(navigate).not.toHaveBeenCalled();
    requests.at(-1)!.next(stats);
    expect(component.loading()).toBe(false);
    expect(component.stats()?.total_applications).toBe(100);
  });

  it('opens a status from chart labels and keyboard activation', () => {
    requests.at(-1)!.next(stats);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const events = component.funnelChartOptions()!.chart.events!;
    events.xAxisLabelClick!(new MouseEvent('click'), undefined, { labelIndex: 5 } as never);
    expect(navigate).toHaveBeenLastCalledWith(['/applications'], {
      queryParams: { ...component.applicationFilters(), status: 'REJECTED' },
    });
    events.markerClick!({ type: 'mouseup' } as MouseEvent, undefined, {
      dataPointIndex: 2,
    } as never);
    expect(navigate).toHaveBeenLastCalledWith(['/applications'], {
      queryParams: { ...component.applicationFilters(), status: 'INTERVIEW' },
    });
    // A real mouse activation is handled by dataPointSelection, not a second marker navigation.
    events.markerClick!(new MouseEvent('mouseup'), undefined, { dataPointIndex: 2 } as never);
    expect(navigate).toHaveBeenCalledTimes(2);
  });

  it('restores a saved relative preset when returning to metrics', async () => {
    component.setPreset('thisYear');
    fixture.destroy();
    fixture = TestBed.createComponent(Metrics);
    component = fixture.componentInstance;
    await fixture.whenStable();
    expect(component.selectedPreset()).toBe('This Year');
    expect(component.startDate()!.getFullYear()).toBe(new Date().getFullYear());
    expect(component.startDate()!.getMonth()).toBe(0);
    expect(component.startDate()!.getDate()).toBe(1);
  });

  it('restores exact custom calendar dates', async () => {
    component.onDateChange([new Date(2026, 0, 12), new Date(2026, 2, 8)]);
    fixture.destroy();
    fixture = TestBed.createComponent(Metrics);
    component = fixture.componentInstance;
    await fixture.whenStable();
    expect(component.selectedPreset()).toBeNull();
    expect(component.applicationFilters()).toMatchObject({
      start_date: '2026-01-12',
      end_date: '2026-03-08',
    });
    expect(service.loadStats).toHaveBeenLastCalledWith('2026-01-12', '2026-03-08');
  });

  it('falls back safely for malformed storage or unavailable browser storage', async () => {
    fixture.destroy();
    localStorage.setItem(
      'hirely.metrics.period.v1',
      JSON.stringify({ version: 1, preset: null, start: '2026-02-30', end: '2026-03-10' })
    );
    fixture = TestBed.createComponent(Metrics);
    component = fixture.componentInstance;
    await fixture.whenStable();
    expect(component.selectedPreset()).toBe('Last 30 days');
    fixture.destroy();
    vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    fixture = TestBed.createComponent(Metrics);
    component = fixture.componentInstance;
    await fixture.whenStable();
    expect(component.selectedPreset()).toBe('Last 30 days');
    expect(() => component.setPreset('7days')).not.toThrow();
    expect(component.selectedPreset()).toBe('Last 7 days');
  });

  it('exposes a retry after a metrics request fails', async () => {
    requests.at(-1)!.error(new Error('offline'));
    expect(component.loadError()).toBe(true);
    component.retry();
    await fixture.whenStable();
    expect(component.loadError()).toBe(false);
    expect(component.loading()).toBe(true);
    requests.at(-1)!.next(stats);
    expect(component.loading()).toBe(false);
  });
});
