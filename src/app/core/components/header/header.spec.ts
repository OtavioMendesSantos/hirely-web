import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HeaderComponent } from './header';
import { AuthService } from '../../services/auth';
import { signal } from '@angular/core';
import { vi } from 'vitest';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let authServiceMock: { currentUser: ReturnType<typeof signal>; logout: any; getToken: any };

  beforeEach(async () => {
    authServiceMock = {
      currentUser: signal(null),
      logout: vi.fn(),
      getToken: vi.fn().mockReturnValue(null),
    };

    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('jwt_token');
    }

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: authServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    // Cleanup any lingering overlay elements from document.body after tests
    document
      .querySelectorAll('hlm-alert-dialog-content, hlm-alert-dialog-overlay')
      .forEach((el) => el.remove());
  });

  it('should create and show brand Hirely and login/register buttons when not logged in', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Hirely');
    expect(compiled.textContent).toContain('Log In');
    expect(compiled.textContent).toContain('Sign Up');
  });

  it('should show Dashboard and user menu when logged in', async () => {
    authServiceMock.currentUser.set({ id: '1', email: 'test@example.com', name: 'Test' } as any);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Dashboard');
    expect(compiled.querySelector('app-user-menu')).toBeTruthy();
  });
});
