import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { Dashboard } from './dashboard';
import { AuthService } from '../../core/services/auth';
import { ApplicationService } from '../../core/services/application';
import { User } from '../../core/models/user.model';
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
      loading: signal(false),
      loadApplications: vi.fn().mockReturnValue(of({ applications: [] })),
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
      loading: signal(false),
      loadApplications: vi.fn().mockReturnValue(of({ applications: [] })),
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
});
