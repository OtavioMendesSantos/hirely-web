import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { Dashboard } from './dashboard';
import { AuthService } from '../../core/services/auth';
import { ApplicationService } from '../../core/services/application';
import { User } from '../../core/models/user.model';
import { GroupedApplications } from '../../core/models/application.model';
import { vi } from 'vitest';

describe('Dashboard', () => {
  it('should create and display welcome with user name when user is logged in', async () => {
    const mockUser: User = {
      id: '1',
      name: 'Otavio',
      email: 'otavio@example.com',
      createdAt: '2026-01-01',
    };
    const authServiceMock = {
      currentUser: signal<User | null>(mockUser),
      logout: vi.fn(),
      getToken: vi.fn().mockReturnValue(null),
    };
    const appServiceMock = {
      applications: signal([]),
      groupedApplications: signal<GroupedApplications>({
        TO_APPLY: [],
        APPLIED: [],
        INTERVIEW: [],
        OFFER: [],
        ACCEPTED: [],
        REJECTED: [],
        OTHER: [],
      }),
      nextPageToken: signal(undefined),
      loading: signal(false),
      loadApplications: vi.fn().mockReturnValue(of({ applications: [] })),
      loadGroupedApplications: vi.fn().mockReturnValue(of({ grouped_applications: {} })),
    };

    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('jwt_token');
    }

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
        { provide: ApplicationService, useValue: appServiceMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(Dashboard);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component).toBeTruthy();
    expect(component.currentUser()).toEqual(mockUser);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Welcome back, Otavio!');
  });

  it('should handle null user when not logged in', async () => {
    const authServiceMock = {
      currentUser: signal<User | null>(null),
      logout: vi.fn(),
      getToken: vi.fn().mockReturnValue(null),
    };
    const appServiceMock = {
      applications: signal([]),
      groupedApplications: signal<GroupedApplications>({
        TO_APPLY: [],
        APPLIED: [],
        INTERVIEW: [],
        OFFER: [],
        ACCEPTED: [],
        REJECTED: [],
        OTHER: [],
      }),
      nextPageToken: signal(undefined),
      loading: signal(false),
      loadApplications: vi.fn().mockReturnValue(of({ applications: [] })),
      loadGroupedApplications: vi.fn().mockReturnValue(of({ grouped_applications: {} })),
    };

    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('jwt_token');
    }

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
        { provide: ApplicationService, useValue: appServiceMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(Dashboard);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component).toBeTruthy();
    expect(component.currentUser()).toBeNull();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Welcome back, Recruiter!');
  });

  it('should reorder applications within the same column on drop', async () => {
    const authServiceMock = {
      currentUser: signal<User | null>({
        id: '1',
        name: 'Otavio',
        email: 'otavio@example.com',
        createdAt: '2026-01-01',
      }),
      logout: vi.fn(),
      getToken: vi.fn().mockReturnValue(null),
    };
    const app1 = { id: 'a1', jobTitle: 'Dev', companyName: 'Acme', status: 'APPLIED' } as any;
    const app2 = { id: 'a2', jobTitle: 'QA', companyName: 'Beta', status: 'APPLIED' } as any;
    const appServiceMock = {
      applications: signal([app1, app2]),
      groupedApplications: signal<GroupedApplications>({
        TO_APPLY: [],
        APPLIED: [app1, app2],
        INTERVIEW: [],
        OFFER: [],
        ACCEPTED: [],
        REJECTED: [],
        OTHER: [],
      }),
      nextPageToken: signal(undefined),
      loading: signal(false),
      loadApplications: vi.fn().mockReturnValue(of({ applications: [] })),
      loadGroupedApplications: vi.fn().mockReturnValue(of({ grouped_applications: {} })),
    };

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
        { provide: ApplicationService, useValue: appServiceMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(Dashboard);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const mockContainer = { id: 'APPLIED' };
    const mockDropEvent = {
      previousContainer: mockContainer,
      container: mockContainer,
      previousIndex: 0,
      currentIndex: 1,
      item: { data: app1 },
    } as any;

    component.onApplicationDrop(mockDropEvent);
    expect(appServiceMock.groupedApplications()['APPLIED']).toEqual([app2, app1]);
  });

  it('should optimistically move application across columns and call patch API', async () => {
    const authServiceMock = {
      currentUser: signal<User | null>({
        id: '1',
        name: 'Otavio',
        email: 'otavio@example.com',
        createdAt: '2026-01-01',
      }),
      logout: vi.fn(),
      getToken: vi.fn().mockReturnValue(null),
    };
    const app1 = { id: 'a1', jobTitle: 'Dev', companyName: 'Acme', status: 'APPLIED' } as any;
    const updateSpy = vi.fn().mockReturnValue(of({ ...app1, status: 'INTERVIEW' }));
    const appServiceMock = {
      applications: signal([app1]),
      groupedApplications: signal<GroupedApplications>({
        TO_APPLY: [],
        APPLIED: [app1],
        INTERVIEW: [],
        OFFER: [],
        ACCEPTED: [],
        REJECTED: [],
        OTHER: [],
      }),
      nextPageToken: signal(undefined),
      loading: signal(false),
      loadApplications: vi.fn().mockReturnValue(of({ applications: [] })),
      loadGroupedApplications: vi.fn().mockReturnValue(of({ grouped_applications: {} })),
      updateApplication: updateSpy,
    };

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
        { provide: ApplicationService, useValue: appServiceMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(Dashboard);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const mockDropEvent = {
      previousContainer: { id: 'APPLIED' },
      container: { id: 'INTERVIEW' },
      previousIndex: 0,
      currentIndex: 0,
      item: { data: app1 },
    } as any;

    component.onApplicationDrop(mockDropEvent);
    expect(appServiceMock.groupedApplications()['APPLIED']).toEqual([]);
    expect(appServiceMock.groupedApplications()['INTERVIEW'][0].id).toBe('a1');
    expect(appServiceMock.groupedApplications()['INTERVIEW'][0].status).toBe('INTERVIEW');
    expect(updateSpy).toHaveBeenCalledWith('a1', { status: 'INTERVIEW' });
  });
});
