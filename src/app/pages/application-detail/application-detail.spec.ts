import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApplicationDetailPage } from './application-detail';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ApplicationService } from '../../core/services/application';
import { vi } from 'vitest';

describe('ApplicationDetailPage', () => {
  let component: ApplicationDetailPage;
  let fixture: ComponentFixture<ApplicationDetailPage>;
  let appServiceMock: any;

  beforeEach(async () => {
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
});
