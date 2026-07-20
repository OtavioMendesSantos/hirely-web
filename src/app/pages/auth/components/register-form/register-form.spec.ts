import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { RegisterFormComponent } from './register-form';
import { AuthService } from '../../../../core/services/auth';
import { User } from '../../../../core/models/user.model';
import { toast } from '@spartan-ng/brain/sonner';

describe('RegisterFormComponent', () => {
  let component: RegisterFormComponent;
  let fixture: ComponentFixture<RegisterFormComponent>;
  let authServiceMock: {
    register: ReturnType<typeof vi.fn>;
    currentUser: ReturnType<typeof signal<User | null>>;
  };
  let routerMock: {
    navigate: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    authServiceMock = {
      register: vi.fn(),
      currentUser: signal<User | null>(null),
    };

    routerMock = {
      navigate: vi.fn(),
    };

    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(toast, 'error').mockImplementation(() => '');
    vi.spyOn(toast, 'info').mockImplementation(() => '');

    await TestBed.configureTestingModule({
      imports: [RegisterFormComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should clear form fields when clearForm is called', () => {
    component.name = 'Test Name';
    component.email = 'test@example.com';
    component.password = '123456';
    component.rememberMe = false;

    component.clearForm();

    expect(component.name).toBe('');
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

      expect(authServiceMock.register).toHaveBeenCalledWith(
        'New User',
        'new@example.com',
        'secret',
        true
      );
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

      expect(authServiceMock.register).toHaveBeenCalledWith(
        'New User',
        'new@example.com',
        'secret',
        true
      );
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
