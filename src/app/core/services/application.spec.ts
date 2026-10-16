import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ApplicationService } from './application';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth';
import { Application } from '../models/application.model';

const app: Application = {
  id: 'a',
  userId: 'u',
  jobTitle: 'Engineer',
  companyName: 'Acme',
  status: 'ACCEPTED',
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

describe('ApplicationService', () => {
  let service: ApplicationService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { currentUser: signal({ id: 'u' }) } },
      ],
    });
    service = TestBed.inject(ApplicationService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('queries archives without changing the dashboard state', () => {
    service.applications.set([app]);
    service
      .queryApplications({
        archive_state: 'archived',
        search: 'Acme',
        page_size: 20,
        page_token: 'cursor',
        order_by: 'archived_at',
        order: 'desc',
      })
      .subscribe();
    const request = http.expectOne((r) => r.url.endsWith('/users/u/applications'));
    expect(request.request.params.get('archive_state')).toBe('archived');
    expect(request.request.params.get('page_token')).toBe('cursor');
    request.flush({ applications: [], next_page_token: 'next' });
    expect(service.applications()).toEqual([app]);
    expect(service.nextPageToken()).toBeUndefined();
  });

  it('removes archived cards only after success and ignores an older grouped response', () => {
    service.applications.set([app]);
    service.groupedApplications.update((groups) => ({ ...groups, ACCEPTED: [app] }));
    service.loadGroupedApplications()?.subscribe();
    const oldRequest = http.expectOne((r) => r.url.endsWith('/grouped-by-status'));
    service.archiveApplication('a').subscribe();
    expect(service.applications()).toEqual([app]);
    http.expectOne((r) => r.url.endsWith('/a/archive')).flush({ ...app, archivedAt: '2026-04-01' });
    oldRequest.flush({ grouped_applications: { ACCEPTED: [app] } });
    expect(service.applications()).toEqual([]);
    expect(service.groupedApplications().ACCEPTED).toEqual([]);
  });
  it('permanently deletes events without changing application status or archive date', () => {
    const archived = {
      ...app,
      archivedAt: '2026-04-01',
      events: [
        {
          id: 'e',
          applicationId: 'a',
          description: 'Archived',
          type: 'AUTOMATIC' as const,
          action: 'ARCHIVED' as const,
          createdAt: '2026-04-01',
        },
      ],
    };
    service.applications.set([archived]);
    service.groupedApplications.update((groups) => ({ ...groups, ACCEPTED: [archived] }));
    service.deleteEvent('a', 'e').subscribe();
    const request = http.expectOne((r) => r.url.endsWith('/a/events/e'));
    expect(request.request.method).toBe('DELETE');
    expect(service.applications()[0].events).toHaveLength(1);
    request.flush(null, { status: 204, statusText: 'No Content' });
    expect(service.applications()[0]).toMatchObject({
      status: 'ACCEPTED',
      archivedAt: '2026-04-01',
      events: [],
    });
    expect(service.groupedApplications().ACCEPTED[0].events).toEqual([]);
    expect(service.stats()).toBeNull();
  });
});
