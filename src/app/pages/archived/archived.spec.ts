import { signal } from '@angular/core';
import { AuthService } from '../../core/services/auth';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { ApplicationService } from '../../core/services/application';
import { Application, ListApplicationsResponse } from '../../core/models/application.model';
import { Archived } from './archived';

const application: Application = {
  id: 'a',
  userId: 'u',
  jobTitle: 'Engineer',
  companyName: 'Acme',
  status: 'ACCEPTED',
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
  archivedAt: '2026-04-01',
};

describe('Archived pagination', () => {
  const currentUser = signal<{ id: string } | null>({ id: 'u' });
  const requests: Subject<ListApplicationsResponse>[] = [];
  const params = new BehaviorSubject(convertToParamMap({}));
  const service = {
    queryApplications: vi.fn(() => {
      const request = new Subject<ListApplicationsResponse>();
      requests.push(request);
      return request;
    }),
    restoreApplication: vi.fn(() => of({ ...application, archivedAt: null })),
    deleteApplication: vi.fn(() => of(undefined)),
  };

  beforeEach(() => {
    currentUser.set({ id: 'u' });
    params.next(convertToParamMap({}));
    requests.length = 0;
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { currentUser } },
        { provide: ActivatedRoute, useValue: { queryParamMap: params } },
        { provide: ApplicationService, useValue: service },
      ],
    });
  });

  it('keeps its own results and sends the next and previous cursors', () => {
    const page = TestBed.runInInjectionContext(() => new Archived());
    requests[0].next({ applications: [application], next_page_token: 'second' });
    page.next();
    expect(service.queryApplications).toHaveBeenLastCalledWith(
      expect.objectContaining({
        archive_state: 'archived',
        page_size: 21,
        page_token: 'second',
        order_by: 'archived_at',
      })
    );
    requests[1].next({ applications: [] });
    page.previous();
    expect(service.queryApplications).toHaveBeenLastCalledWith(
      expect.objectContaining({ page_token: undefined })
    );
    expect(page.cursors()).toHaveLength(1);
  });

  it('ignores late responses after filters change and returns to page one', () => {
    const page = TestBed.runInInjectionContext(() => new Archived());
    requests[0].next({ applications: [application], next_page_token: 'second' });
    page.next();
    params.next(convertToParamMap({ search: 'Another company', status: 'REJECTED' }));
    requests[2].next({ applications: [] });
    requests[1].next({ applications: [application], next_page_token: 'obsolete' });
    expect(page.applications()).toEqual([]);
    expect(page.cursors()).toEqual([undefined]);
    expect(page.nextToken()).toBeUndefined();
  });

  it('restores and deletes through the API then reloads the first page', () => {
    const page = TestBed.runInInjectionContext(() => new Archived());
    requests[0].next({ applications: [application], next_page_token: 'second' });
    page.next();
    page.restore(application);
    expect(service.restoreApplication).toHaveBeenCalledWith('a');
    expect(page.cursors()).toEqual([undefined]);
    page.askDelete(application);
    page.confirmDelete();
    expect(service.deleteApplication).toHaveBeenCalledWith('a');
    expect(page.deleteTarget()).toBeNull();
  });
  it('does not invalidate a pending query for a filter that is unchanged', () => {
    const page = TestBed.runInInjectionContext(() => new Archived());
    page.updateFilters({ search: null, order: 'desc' });
    requests[0].next({ applications: [application] });
    expect(page.applications()).toEqual([application]);
    expect(page.loading()).toBe(false);
  });

  it('clears old account results and ignores responses before the account effect runs', () => {
    const page = TestBed.runInInjectionContext(() => new Archived());
    TestBed.tick();
    currentUser.set({ id: 'another-user' });
    requests[0].next({ applications: [application], next_page_token: 'old-cursor' });
    expect(page.applications()).toEqual([]);
    TestBed.tick();
    expect(page.cursors()).toEqual([undefined]);
    expect(page.nextToken()).toBeUndefined();
    requests[1].next({ applications: [] });
    expect(page.loading()).toBe(false);
    currentUser.set(null);
    TestBed.tick();
    expect(page.applications()).toEqual([]);
    expect(page.deleteTarget()).toBeNull();
  });
});
