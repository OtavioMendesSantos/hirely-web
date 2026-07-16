import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HeaderComponent } from './header';
import { AuthService } from '../../../core/services/auth';
import { signal } from '@angular/core';
import { vi } from 'vitest';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let component: HeaderComponent;
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
      imports: [HeaderComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    // Cleanup any lingering overlay elements from document.body after tests
    document.querySelectorAll('hlm-alert-dialog-content, hlm-alert-dialog-overlay').forEach(el => el.remove());
  });

  it('should create and show brand Hirely and login/register buttons when not logged in', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Hirely');
    expect(compiled.textContent).toContain('Log In');
    expect(compiled.textContent).toContain('Sign Up');
  });

  it('should show Dashboard and Log Out buttons when logged in', async () => {
    authServiceMock.currentUser.set({ id: '1', email: 'test@example.com', name: 'Test' } as any);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Dashboard');
    expect(compiled.textContent).toContain('Log Out');
  });

  it('should open alert dialog when Log Out is clicked and logout on action confirm', async () => {
    authServiceMock.currentUser.set({ id: '1', email: 'test@example.com', name: 'Test' } as any);
    fixture.detectChanges();
    await fixture.whenStable();

    const triggerBtn = fixture.nativeElement.querySelector('button[hlmAlertDialogTrigger]') as HTMLButtonElement;
    expect(triggerBtn).toBeTruthy();
    triggerBtn.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const dialogContent = document.querySelector('hlm-alert-dialog-content') as HTMLElement;
    expect(dialogContent).toBeTruthy();
    expect(dialogContent.textContent).toContain('Confirm Log Out');

    const actionBtn = document.querySelector('button[hlmAlertDialogAction]') as HTMLButtonElement;
    expect(actionBtn).toBeTruthy();
    actionBtn.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(authServiceMock.logout).toHaveBeenCalled();
  });

  it('should close confirmation modal without logging out on cancel', async () => {
    authServiceMock.currentUser.set({ id: '1', email: 'test@example.com', name: 'Test' } as any);
    fixture.detectChanges();
    await fixture.whenStable();

    const triggerBtn = fixture.nativeElement.querySelector('button[hlmAlertDialogTrigger]') as HTMLButtonElement;
    expect(triggerBtn).toBeTruthy();
    triggerBtn.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const dialogContent = document.querySelector('hlm-alert-dialog-content') as HTMLElement;
    expect(dialogContent).toBeTruthy();

    const cancelBtn = document.querySelector('button[hlmAlertDialogCancel]') as HTMLButtonElement;
    expect(cancelBtn).toBeTruthy();
    cancelBtn.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(authServiceMock.logout).not.toHaveBeenCalled();
  });
});
