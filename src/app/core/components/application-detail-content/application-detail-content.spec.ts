import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApplicationDetailContentComponent } from './application-detail-content';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideMarkdown } from 'ngx-markdown';
import { ApplicationService } from '../../services/application';
import { of, Subject } from 'rxjs';
import { vi } from 'vitest';
import { Application } from '../../models/application.model';

describe('ApplicationDetailContentComponent', () => {
  let component: ApplicationDetailContentComponent;
  let fixture: ComponentFixture<ApplicationDetailContentComponent>;
  let appServiceMock: {
    getApplication: ReturnType<typeof vi.fn>;
    addEvent: ReturnType<typeof vi.fn>;
    deleteApplication: ReturnType<typeof vi.fn>;
    archiveApplication: ReturnType<typeof vi.fn>;
    restoreApplication: ReturnType<typeof vi.fn>;
    deleteEvent: ReturnType<typeof vi.fn>;
  };

  const mockApp: Application = {
    id: 'app-1',
    userId: 'user-1',
    companyName: 'Hirely Corp',
    jobTitle: 'Senior Backend Engineer',
    status: 'INTERVIEW',
    appliedAt: '2023-10-24T00:00:00Z',
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
      deleteEvent: vi.fn().mockReturnValue(of(undefined)),
      getApplication: vi.fn().mockReturnValue(of(mockApp)),
      addEvent: vi.fn().mockReturnValue(of({})),
      archiveApplication: vi.fn().mockReturnValue(of({ ...mockApp, archivedAt: '2026-04-01' })),
      restoreApplication: vi.fn().mockReturnValue(of(mockApp)),
      deleteApplication: vi.fn().mockReturnValue(of({})),
    };

    await TestBed.configureTestingModule({
      imports: [ApplicationDetailContentComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideMarkdown(),
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
  it('archives after confirmation from the API and restores without changing status', () => {
    component.toggleArchive();
    expect(appServiceMock.archiveApplication).toHaveBeenCalledWith('app-1');
    expect(component.application()?.archivedAt).toBe('2026-04-01');
    expect(component.application()?.status).toBe('INTERVIEW');
    component.toggleArchive();
    expect(appServiceMock.restoreApplication).toHaveBeenCalledWith('app-1');
    expect(component.application()?.archivedAt).toBeUndefined();
  });

  it('keeps archived applications read-only until restored', () => {
    component.application.set({ ...mockApp, archivedAt: '2026-04-01' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input[placeholder]')).toBeNull();
    component.newNoteText.set('Must not be submitted');
    component.addNote();
    expect(appServiceMock.addEvent).not.toHaveBeenCalled();
  });
  it.each(['MANUAL', 'AUTOMATIC'] as const)(
    'deletes a %s event only after confirmation, including archived applications',
    (type) => {
      const event = { ...mockApp.events![0], type };
      component.application.set({ ...mockApp, archivedAt: '2026-04-01', events: [event] });
      component.askDeleteEvent(event);
      expect(appServiceMock.deleteEvent).not.toHaveBeenCalled();
      appServiceMock.getApplication.mockReturnValue(
        of({ ...mockApp, archivedAt: '2026-04-01', events: [] })
      );
      component.confirmDeleteEvent();
      expect(appServiceMock.deleteEvent).toHaveBeenCalledWith('app-1', 'evt-1');
      expect(component.application()?.events).toEqual([]);
      expect(component.application()?.status).toBe('INTERVIEW');
      expect(component.application()?.archivedAt).toBe('2026-04-01');
      expect(component.eventToDelete()).toBeNull();
    }
  );

  it('keeps the delete event dialog open after failure and prevents duplicate submissions', () => {
    const request = new Subject<void>();
    appServiceMock.deleteEvent.mockReturnValue(request);
    component.askDeleteEvent(mockApp.events![0]);
    component.confirmDeleteEvent();
    component.confirmDeleteEvent();
    expect(appServiceMock.deleteEvent).toHaveBeenCalledTimes(1);
    expect(component.deletingEvent()).toBe(true);
    request.error(new Error('Unavailable'));
    expect(component.deletingEvent()).toBe(false);
    expect(component.eventToDelete()?.id).toBe('evt-1');
    expect(component.eventDeleteError()).toContain("Couldn't delete");
    expect(component.application()?.events).toHaveLength(1);
  });
});
