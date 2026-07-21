import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserMenuComponent } from './user-menu';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth';
import { signal } from '@angular/core';
import { vi } from 'vitest';

describe('UserMenuComponent', () => {
  let component: UserMenuComponent;
  let fixture: ComponentFixture<UserMenuComponent>;
  let authServiceMock: any;

  beforeEach(async () => {
    authServiceMock = {
      currentUser: signal({ id: '1', email: 'test@example.com', name: 'Test' }),
      logout: vi.fn(),
      getToken: vi.fn().mockReturnValue(null),
    };

    await TestBed.configureTestingModule({
      imports: [UserMenuComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    document
      .querySelectorAll('hlm-alert-dialog-content, hlm-alert-dialog-overlay')
      .forEach((el) => el.remove());
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open alert dialog when openLogoutConfirm is called and confirm logout', async () => {
    component.openLogoutConfirm();
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

  it('should close dialog without logging out on cancel', async () => {
    component.openLogoutConfirm();
    fixture.detectChanges();
    await fixture.whenStable();

    const cancelBtn = document.querySelector('button[hlmAlertDialogCancel]') as HTMLButtonElement;
    expect(cancelBtn).toBeTruthy();
    cancelBtn.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(authServiceMock.logout).not.toHaveBeenCalled();
  });
});
