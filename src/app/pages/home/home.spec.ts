import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Home } from './home';
import { AuthService } from '../../core/services/auth';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { vi } from 'vitest';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  let authServiceMock: { currentUser: ReturnType<typeof signal>; logout: any; getToken: any };
  let routerMock: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    authServiceMock = {
      currentUser: signal(null),
      logout: vi.fn(),
      getToken: vi.fn().mockReturnValue(null),
    };

    routerMock = {
      navigate: vi.fn(),
    };

    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('jwt_token');
    }

    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to dashboard on init when user is logged in', () => {
    authServiceMock.currentUser.set({ id: '1', name: 'Otavio' } as any);
    component.ngOnInit();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard'], { replaceUrl: true });
  });
});
