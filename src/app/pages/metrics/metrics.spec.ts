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
