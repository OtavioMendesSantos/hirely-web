import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';
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
    getToken: ReturnType<typeof vi.fn>;
    currentUser: ReturnType<typeof signal<User | null>>;
  };
  let routerMock: {
    navigate: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    authServiceMock = {
      login: vi.fn(),
      register: vi.fn(),
      getToken: vi.fn().mockReturnValue(null),
      currentUser: signal<User | null>(null),
    };

    routerMock = {
      navigate: vi.fn(),
    };

    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(toast, 'info').mockImplementation(() => '');

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

  it('should toggle mode between login and register', () => {
    expect(component.isLoginMode()).toBe(true);

    component.toggleMode();
    expect(component.isLoginMode()).toBe(false);

    component.toggleMode();
    expect(component.isLoginMode()).toBe(true);
  });

  it('should trigger onInProgress toast', () => {
    component.onInProgress('Test Feature');
    expect(toast.info).toHaveBeenCalledWith(
      'In progress: "Test Feature" estará disponível em breve!',
      { duration: 3500 }
    );
  });

  it('should redirect to dashboard on init when user is logged in', () => {
    authServiceMock.currentUser.set({ id: '1', name: 'Otavio' } as any);
    component.ngOnInit();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard'], { replaceUrl: true });
  });
});
