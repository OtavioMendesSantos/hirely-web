import { signal } from '@angular/core';
import { AuthService } from '../../core/services/auth';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApplicationDetailPage } from './application-detail';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { NEVER, of } from 'rxjs';
import { ApplicationService } from '../../core/services/application';
import { vi } from 'vitest';

describe('ApplicationDetailPage', () => {
  let component: ApplicationDetailPage;
  let fixture: ComponentFixture<ApplicationDetailPage>;
  let appServiceMock: { getApplication: ReturnType<typeof vi.fn> };
  const currentUser = signal<{ id: string } | null>({ id: 'user-1' });

  beforeEach(async () => {
    currentUser.set({ id: 'user-1' });
    appServiceMock = {
      getApplication: vi.fn().mockReturnValue(
        of({
          id: 'app-1',
          userId: 'user-1',
          companyName: 'Hirely Corp',
          jobTitle: 'Senior Backend Engineer',
          status: 'APPLIED',
          createdAt: '2023-10-24T00:00:00Z',
          updatedAt: '2023-10-24T00:00:00Z',
        })
      ),
    };

    await TestBed.configureTestingModule({
      imports: [ApplicationDetailPage],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { currentUser } },
        provideHttpClient(),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: () => 'app-1' }),
            snapshot: { paramMap: { get: () => 'app-1' } },
          },
        },
        { provide: ApplicationService, useValue: appServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicationDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and update pageTitle on loaded', () => {
    expect(component).toBeTruthy();
    expect(component.applicationId()).toBe('app-1');
  });
  it('clears the previous application title and breadcrumbs when accounts change', () => {
    expect(component.pageTitle()).toBe('Senior Backend Engineer');
    appServiceMock.getApplication.mockReturnValue(NEVER);
    currentUser.set({ id: 'user-2' });
    fixture.detectChanges();
    expect(component.pageTitle()).toBe('Application Details');
    expect(component.breadcrumbItems().map((item) => item.label)).not.toContain(
      'Senior Backend Engineer'
    );
  });
});
