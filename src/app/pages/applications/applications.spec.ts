import { ViewportScroller } from '@angular/common';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, NavigationExtras, Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { ApplicationService } from '../../core/services/application';
import { AuthService } from '../../core/services/auth';
import { Application, ListApplicationsResponse } from '../../core/models/application.model';
import { Applications } from './applications';

const application: Application = {
  id: 'a',
  userId: 'u',
  jobTitle: 'Engineer',
  companyName: 'Acme',
  status: 'REJECTED',
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

describe('Applications list', () => {
  const currentUser = signal<{ id: string } | null>({ id: 'u' });
  const params = new BehaviorSubject(convertToParamMap({}));
  const requests: Subject<ListApplicationsResponse>[] = [];
  let currentParams: Record<string, string> = {};
  let navigationState: Record<string, unknown> = {};
  let navigationTrigger: 'imperative' | 'popstate' = 'imperative';
  const viewport = { getScrollPosition: vi.fn(() => [0, 720]), scrollToPosition: vi.fn() };
  const service = {
    queryApplications: vi.fn(() => {
      const request = new Subject<ListApplicationsResponse>();
      requests.push(request);
      return request;
    }),
  };
  const router = {
    currentNavigation: () => ({ trigger: navigationTrigger, extras: { state: navigationState } }),
    navigate: vi.fn((_commands: unknown[], extras: NavigationExtras) => {
      navigationState = extras.state || {};
      for (const [key, value] of Object.entries(extras.queryParams || {})) {
        if (value == null) delete currentParams[key];
        else currentParams[key] = value;
      }
      params.next(convertToParamMap(currentParams));
      return Promise.resolve(true);
    }),
  };

  beforeEach(() => {
    currentUser.set({ id: 'u' });
    currentParams = {};
    navigationState = {};
    navigationTrigger = 'imperative';
    params.next(convertToParamMap({}));
    requests.length = 0;
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        { provide: ActivatedRoute, useValue: { queryParamMap: params } },
        { provide: Router, useValue: router },
        { provide: ViewportScroller, useValue: viewport },
        { provide: ApplicationService, useValue: service },
        { provide: AuthService, useValue: { currentUser } },
      ],
    });
  });

  function pageWith(values: Record<string, string> = {}) {
    currentParams = values;
    params.next(convertToParamMap(values));
    return TestBed.runInInjectionContext(() => new Applications());
  }

  it('combines metric, status, date-only dates and search with all archive states by default', () => {
    const page = pageWith({
      metric: 'interviews',
      status: 'REJECTED,ACCEPTED',
      start_date: '2026-01-01',
      end_date: '2026-01-31',
      search: 'Acme',
      order_by: 'updated_at',
      order: 'asc',
    });
    expect(service.queryApplications).toHaveBeenLastCalledWith(
      expect.objectContaining({
        archive_state: 'all',
        metric: 'interviews',
        status: 'REJECTED,ACCEPTED',
        search: 'Acme',
        start_date: '2026-01-01',
        end_date: '2026-01-31',
        order_by: 'updated_at',
        order: 'asc',
        page_size: 20,
      })
    );
    requests[0].next({ applications: [application], total_count: 43, next_page_token: 'next' });
    expect(page.total()).toBe(43);
    expect(page.metricDescription()).toContain('recorded interview');
    page.updateFilters({ metric: null });
    expect(service.queryApplications).toHaveBeenLastCalledWith(
      expect.objectContaining({ metric: undefined })
    );
    expect(page.metricDescription()).toBe('');
  });

  it.each(['direct_rejections', 'advanced_rejections', 'ghosting'])(
    'shows a removable %s metric filter',
    (metric) => {
      const page = pageWith({ metric });
      expect(page.metric()).toBe(metric);
      expect(page.metricDescription()).not.toBe('');
      page.updateFilters({ metric: null });
      expect(page.metric()).toBeNull();
    }
  );

  it.each([
    { start_date: '2026-02-30' },
    { end_date: '2026-13-01' },
    { start_date: '2026-02-01T00:00:00Z' },
    { start_date: '2026-02-02', end_date: '2026-02-01' },
  ] as Record<string, string>[])(
    'rejects invalid or reversed dates without requesting data: %o',
    (values) => {
      const page = pageWith(values);
      expect(page.dateError()).toBeTruthy();
      expect(service.queryApplications).not.toHaveBeenCalled();
      expect(page.loading()).toBe(false);
    }
  );

  it('keeps cursor navigation in the URL and restores its history stack when returning from details', () => {
    const page = pageWith();
    requests[0].next({ applications: [application], total_count: 43, next_page_token: 'second' });
    page.next();
    expect(currentParams['page_token']).toBe('second');
    expect(page.cursors()).toEqual([undefined, 'second']);
    requests[1].next({ applications: [application], total_count: 43, next_page_token: 'third' });
    page.next();
    expect(currentParams['page_token']).toBe('third');
    expect(navigationState['applicationListCursors']).toEqual([undefined, 'second', 'third']);
    const returnedPage = TestBed.runInInjectionContext(() => new Applications());
    expect(returnedPage.cursors()).toEqual([undefined, 'second', 'third']);
    requests[3].next({ applications: [application], total_count: 43 });
    returnedPage.previous();
    expect(currentParams['page_token']).toBe('second');
    expect(returnedPage.cursors()).toEqual([undefined, 'second']);
    expect(service.queryApplications).toHaveBeenLastCalledWith(
      expect.objectContaining({ page_token: 'second' })
    );
  });

  it('resets pagination on filters and ignores old responses', () => {
    const page = pageWith();
    requests[0].next({ applications: [application], next_page_token: 'second' });
    page.next();
    page.toggleStatus('ACCEPTED');
    expect(currentParams['page_token']).toBeUndefined();
    expect(page.cursors()).toEqual([undefined]);
    requests[2].next({ applications: [], total_count: 0 });
    requests[1].next({ applications: [application], total_count: 12, next_page_token: 'obsolete' });
    expect(page.applications()).toEqual([]);
    expect(page.total()).toBe(0);
    expect(page.nextToken()).toBeUndefined();
  });

  it('preserves an in-flight read when filters are unchanged', () => {
    const page = pageWith();
    page.updateFilters({ search: null, archive_state: 'all' });
    expect(router.navigate).not.toHaveBeenCalled();
    requests[0].next({ applications: [application] });
    expect(page.applications()).toEqual([application]);
    expect(page.loading()).toBe(false);
  });

  it('clears account data and cursors, ignoring a response before the account effect runs', () => {
    const page = pageWith({ page_token: 'old-account-cursor' });
    TestBed.tick();
    currentUser.set({ id: 'other-user' });
    requests[0].next({ applications: [application], total_count: 30 });
    expect(page.applications()).toEqual([]);
    TestBed.tick();
    expect(currentParams['page_token']).toBeUndefined();
    expect(page.cursors()).toEqual([undefined]);
    requests[1].next({ applications: [], total_count: 0 });
    currentUser.set(null);
    TestBed.tick();
    expect(page.applications()).toEqual([]);
    expect(page.total()).toBeNull();
  });
  it('restores list scrolling after the results render when returning from details', () => {
    const page = pageWith();
    requests[0].next({ applications: [application], total_count: 20 });
    page.rememberPosition();
    navigationState = history.state;
    expect(navigationState['applicationListScroll']).toEqual([0, 720]);
    navigationTrigger = 'popstate';
    TestBed.runInInjectionContext(() => new Applications());
    expect(viewport.scrollToPosition).not.toHaveBeenCalled();
    requests[1].next({ applications: [application], total_count: 20 });
    TestBed.tick();
    expect(viewport.scrollToPosition).toHaveBeenCalledWith([0, 720], { behavior: 'instant' });
  });

  it('cancels pending typed search when filters are cleared', () => {
    vi.useFakeTimers();
    try {
      const page = pageWith({ metric: 'interviews' });
      page.onSearchChange('A search still being typed');
      page.clearFilters();
      vi.advanceTimersByTime(500);
      expect(currentParams['search']).toBeUndefined();
      expect(page.search()).toBe('');
      expect(service.queryApplications).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });
});
