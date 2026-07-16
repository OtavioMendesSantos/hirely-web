import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Dashboard } from './dashboard';
import { AuthService } from '../../core/auth';
import { User } from '../../core/models/user.model';

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
    };

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Dashboard);
    const component = fixture.componentInstance;
    await fixture.whenStable();

    expect(component).toBeTruthy();
    expect(component.currentUser).toEqual(mockUser);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('p')?.textContent?.trim()).toContain('hello Otavio');
  });

  it('should handle null user when not logged in', async () => {
    const authServiceMock = {
      currentUser: signal<User | null>(null),
    };

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Dashboard);
    const component = fixture.componentInstance;
    await fixture.whenStable();

    expect(component).toBeTruthy();
    expect(component.currentUser).toBeNull();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('p')?.textContent?.trim()).toBe('hello');
  });
});
