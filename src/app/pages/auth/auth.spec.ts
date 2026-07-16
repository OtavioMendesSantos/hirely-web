import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { Auth } from './auth';
import { AuthService } from '../../core/services/auth';
import { User } from '../../core/models/user.model';
import { toast } from '@spartan-ng/brain/sonner';

describe('Auth', () => {
  let component: Auth;
  let fixture: ComponentFixture<Auth>;
  let authServiceMock: {
    login: ReturnType<typeof vi.fn>;
    register: ReturnType<typeof vi.fn>;
    currentUser: ReturnType<typeof signal<User | null>>;
  };
  let routerMock: {
    navigate: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    authServiceMock = {
      login: vi.fn(),
      register: vi.fn(),
      currentUser: signal<User | null>(null),
    };

    routerMock = {
      navigate: vi.fn(),
    };

    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(toast, 'error').mockImplementation(() => '');

    await TestBed.configureTestingModule({
      imports: [Auth],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Auth);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start in login mode', () => {
    expect(component.isLoginMode()).toBe(true);
  });

  it('should toggle mode and clear form', () => {
    component.name = 'Test Name';
    component.email = 'test@example.com';
    component.password = '123456';

    component.toggleMode();

    expect(component.isLoginMode()).toBe(false);
    expect(component.name).toBe('');
    expect(component.email).toBe('');
    expect(component.password).toBe('');

    component.toggleMode();
    expect(component.isLoginMode()).toBe(true);
  });

  it('should clear form fields when clearForm is called', () => {
    component.name = 'Test Name';
    component.email = 'test@example.com';
    component.password = '123456';

    component.clearForm();

    expect(component.name).toBe('');
    expect(component.email).toBe('');
    expect(component.password).toBe('');
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

      expect(authServiceMock.login).toHaveBeenCalledWith('test@example.com', 'secret');
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

      expect(authServiceMock.login).toHaveBeenCalledWith('test@example.com', 'wrong');
      expect(toast.error).toHaveBeenCalledWith('Invalid email or password', { duration: 3000 });
    });

    it('should alert fallback error message when login fails without error.message', async () => {
      const mockError = { error: null, message: 'Network error' };
      authServiceMock.login.mockReturnValue(throwError(() => mockError));

      await component.onLogin();

      expect(toast.error).toHaveBeenCalledWith('Network error', { duration: 3000 });
    });
  });

  describe('onRegister', () => {
    it('should call authService.register and navigate on success', async () => {
      const mockResponse = {
        token: 'fake-token',
        user: { id: '1', name: 'New User', email: 'new@example.com', createdAt: '2026-01-01' },
      };
      authServiceMock.register.mockReturnValue(of(mockResponse));

      component.name = 'New User';
      component.email = 'new@example.com';
      component.password = 'secret';

      await component.onRegister();

      expect(authServiceMock.register).toHaveBeenCalledWith('New User', 'new@example.com', 'secret');
      expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should alert error message when register fails', async () => {
      const mockHttpError = new HttpErrorResponse({
        error: {
          error: {
            code: 409,
            message: 'Email already exists',
            status: 'ALREADY_EXISTS',
          },
        },
        status: 409,
      });
      authServiceMock.register.mockReturnValue(throwError(() => mockHttpError));

      component.name = 'New User';
      component.email = 'new@example.com';
      component.password = 'secret';

      await component.onRegister();

      expect(authServiceMock.register).toHaveBeenCalledWith('New User', 'new@example.com', 'secret');
      expect(toast.error).toHaveBeenCalledWith('Email already exists', { duration: 3000 });
    });

    it('should alert fallback error message when register fails without error.message', async () => {
      const mockError = { error: null, message: 'Server unavailable' };
      authServiceMock.register.mockReturnValue(throwError(() => mockError));

      await component.onRegister();

      expect(toast.error).toHaveBeenCalledWith('Server unavailable', { duration: 3000 });
    });
  });
});
