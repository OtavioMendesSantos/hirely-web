import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { LoginFormComponent } from './login-form';
import { AuthService } from '../../../../core/services/auth';
import { User } from '../../../../core/models/user.model';
import { toast } from '@spartan-ng/brain/sonner';

describe('LoginFormComponent', () => {
  let component: LoginFormComponent;
  let fixture: ComponentFixture<LoginFormComponent>;
  let authServiceMock: {
    login: ReturnType<typeof vi.fn>;
    currentUser: ReturnType<typeof signal<User | null>>;
  };
  let routerMock: {
    navigate: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    authServiceMock = {
      login: vi.fn(),
      currentUser: signal<User | null>(null),
    };

    routerMock = {
      navigate: vi.fn(),
    };

    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(toast, 'error').mockImplementation(() => '');
    vi.spyOn(toast, 'info').mockImplementation(() => '');

    await TestBed.configureTestingModule({
      imports: [LoginFormComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default rememberMe to true', () => {
    expect(component.rememberMe).toBe(true);
  });

  it('should clear form fields when clearForm is called', () => {
    component.email = 'test@example.com';
    component.password = '123456';
    component.rememberMe = false;

    component.clearForm();

    expect(component.email).toBe('');
    expect(component.password).toBe('');
    expect(component.rememberMe).toBe(true);
  });

  it('should emit toggleMode event', () => {
    let emitted = false;
    component.toggleMode.subscribe(() => (emitted = true));
    component.toggleMode.emit();
    expect(emitted).toBe(true);
  });

  it('should emit inProgress event when onInProgress is called', () => {
    let emittedFeature = '';
    component.inProgress.subscribe((f) => (emittedFeature = f));
    component.onInProgress('Test Feature');
    expect(emittedFeature).toBe('Test Feature');
  });

  describe('onLogin', () => {
    it('should call authService.login and navigate on success', async () => {
      const mockResponse = {
        token: 'fake-token',
        user: { id: '1', name: 'Test User', email: 'test@example.com', createdAt: '2026-01-01' },
      };
      authServiceMock.login.mockReturnValue(of(mockResponse));

      component.email = 'test@example.com';
      component.password = 'secret';

      await component.onLogin();

      expect(authServiceMock.login).toHaveBeenCalledWith('test@example.com', 'secret', true);
      expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should pass rememberMe false when checkbox is unchecked', async () => {
      const mockResponse = {
        token: 'fake-token',
        user: { id: '1', name: 'Test User', email: 'test@example.com', createdAt: '2026-01-01' },
      };
      authServiceMock.login.mockReturnValue(of(mockResponse));

      component.email = 'test@example.com';
      component.password = 'secret';
      component.rememberMe = false;

      await component.onLogin();

      expect(authServiceMock.login).toHaveBeenCalledWith('test@example.com', 'secret', false);
      expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should alert error message when login fails with error.message', async () => {
      const mockHttpError = new HttpErrorResponse({
        error: {
          error: {
            code: 401,
            message: 'Invalid email or password',
            status: 'UNAUTHENTICATED',
          },
        },
        status: 401,
      });
      authServiceMock.login.mockReturnValue(throwError(() => mockHttpError));

      component.email = 'test@example.com';
      component.password = 'wrong';

      await component.onLogin();

      expect(authServiceMock.login).toHaveBeenCalledWith('test@example.com', 'wrong', true);
      expect(toast.error).toHaveBeenCalledWith('Invalid email or password', { duration: 3000 });
    });

    it('should alert fallback error message when login fails without error.message', async () => {
      const mockError = { error: null, message: 'Network error' };
      authServiceMock.login.mockReturnValue(throwError(() => mockError));

      await component.onLogin();

      expect(toast.error).toHaveBeenCalledWith('Network error', { duration: 3000 });
    });
  });
});
