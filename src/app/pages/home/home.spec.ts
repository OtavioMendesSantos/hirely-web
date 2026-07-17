import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Home } from './home';
import { AuthService } from '../../core/services/auth';
import { signal } from '@angular/core';
import { vi } from 'vitest';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  let authServiceMock: { currentUser: ReturnType<typeof signal>; logout: any };

  beforeEach(async () => {
    authServiceMock = {
      currentUser: signal(null),
      logout: vi.fn(),
    };

    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('jwt_token');
    }

    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideRouter([]), { provide: AuthService, useValue: authServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
