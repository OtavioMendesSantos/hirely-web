import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApplicationDetailContentComponent } from './application-detail-content';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { ApplicationService } from '../../services/application';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { Application } from '../../models/application.model';

describe('ApplicationDetailContentComponent', () => {
  let component: ApplicationDetailContentComponent;
  let fixture: ComponentFixture<ApplicationDetailContentComponent>;
  let appServiceMock: any;

  const mockApp: Application = {
    id: 'app-1',
    userId: 'user-1',
    companyName: 'Hirely Corp',
    jobTitle: 'Senior Backend Engineer',
    status: 'INTERVIEW',
    appliedAt: '2023-10-24T00:00:00Z',
    location: 'San Francisco, CA (Remote)',
    salaryRange: '$150k - $180k',
    notes: 'Test notes',
    events: [
      {
        id: 'evt-1',
        applicationId: 'app-1',
        type: 'MANUAL',
        description: 'Sent message on LinkedIn',
        createdAt: '2023-10-25T00:00:00Z',
      },
    ],
    createdAt: '2023-10-24T00:00:00Z',
    updatedAt: '2023-10-25T00:00:00Z',
  };

  beforeEach(async () => {
    appServiceMock = {
      getApplication: vi.fn().mockReturnValue(of(mockApp)),
      addEvent: vi.fn().mockReturnValue(of({})),
      deleteApplication: vi.fn().mockReturnValue(of({})),
    };

    await TestBed.configureTestingModule({
      imports: [ApplicationDetailContentComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: ApplicationService, useValue: appServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicationDetailContentComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('applicationId', 'app-1');
    fixture.detectChanges();
  });

  afterEach(() => {
    document
      .querySelectorAll('hlm-alert-dialog-content, hlm-alert-dialog-overlay')
      .forEach((el) => el.remove());
  });

  it('should create and load application details', () => {
    expect(component).toBeTruthy();
    expect(appServiceMock.getApplication).toHaveBeenCalledWith('app-1');
    expect(component.application()).toEqual(mockApp);
  });

  it('should render job title, company name and timeline items', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Senior Backend Engineer');
    expect(compiled.textContent).toContain('Hirely Corp');
    expect(compiled.textContent).toContain('Sent message on LinkedIn');
  });

  it('should add a note when addNote is called with text', () => {
    component.newNoteText.set('New check-in note');
    component.addNote();
    expect(appServiceMock.addEvent).toHaveBeenCalledWith('app-1', 'New check-in note');
  });
});
