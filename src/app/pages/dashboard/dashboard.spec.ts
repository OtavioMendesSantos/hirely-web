import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { Dashboard } from './dashboard';
import { AuthService } from '../../core/services/auth';
import { User } from '../../core/models/user.model';
import { vi } from 'vitest';

describe('Dashboard', () => {
  it('should create and display hello with user name when user is logged in', async () => {
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

    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('jwt_token');
    }

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [provideRouter([]), { provide: AuthService, useValue: authServiceMock }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Dashboard);
    const component = fixture.componentInstance;
    await fixture.whenStable();

    expect(component).toBeTruthy();
    expect(component.currentUser).toEqual(mockUser);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[hlmCardTitle]')?.textContent?.trim()).toContain('Hello Otavio');
  });

  it('should handle null user when not logged in', async () => {
    const authServiceMock = {
      currentUser: signal<User | null>(null),
      logout: vi.fn(),
      getToken: vi.fn().mockReturnValue(null),
    };

    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('jwt_token');
    }

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [provideRouter([]), { provide: AuthService, useValue: authServiceMock }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Dashboard);
    const component = fixture.componentInstance;
    await fixture.whenStable();

    expect(component).toBeTruthy();
    expect(component.currentUser).toBeNull();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[hlmCardTitle]')?.textContent?.trim()).toBe('Hello');
  });
});
