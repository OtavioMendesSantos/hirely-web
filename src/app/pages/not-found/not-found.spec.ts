import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NotFound } from './not-found';
import { AuthService } from '../../core/services/auth';
import { signal } from '@angular/core';

describe('NotFound', () => {
  let fixture: ComponentFixture<NotFound>;
  let authServiceMock: { currentUser: ReturnType<typeof signal> };

  beforeEach(async () => {
    authServiceMock = {
      currentUser: signal(null),
    };

    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('jwt_token');
    }

    await TestBed.configureTestingModule({
      imports: [NotFound],
      providers: [provideRouter([]), { provide: AuthService, useValue: authServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(NotFound);
  });

  it('should create and display 404 message in English', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.error-code')?.textContent?.trim()).toBe('404');
    expect(compiled.querySelector('.error-title')?.textContent?.trim()).toBe(
      'Looks like you lost your way in the pipeline.'
    );
    expect(compiled.textContent).toContain(
      "The page you are looking for doesn't exist or has been moved."
    );
  });

  it('should display only GO TO HOME when user is not logged in', async () => {
    authServiceMock.currentUser.set(null);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('GO TO HOME');
    expect(compiled.textContent).not.toContain('BACK TO DASHBOARD');
  });

  it('should display both BACK TO DASHBOARD and GO TO HOME options when user is logged in', async () => {
    authServiceMock.currentUser.set({ id: '1', email: 'test@example.com', name: 'Test' } as any);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('BACK TO DASHBOARD');
    expect(compiled.textContent).toContain('GO TO HOME');
  });
});
