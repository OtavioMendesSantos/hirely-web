import { signal } from '@angular/core';
import { toast } from '@spartan-ng/brain/sonner';
import { AuthService } from '../../services/auth';
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
  const currentUser = signal<{ id: string } | null>({ id: 'user-1' });
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
    currentUser.set({ id: 'user-1' });
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
        { provide: AuthService, useValue: { currentUser } },
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
    vi.restoreAllMocks();
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
  it('ignores an archive response after switching accounts before the synchronization effect', () => {
    const request = new Subject<Application>();
    const toastSpy = vi.spyOn(toast, 'success');
    const loaded = vi.spyOn(component.applicationLoaded, 'emit');
    appServiceMock.archiveApplication.mockReturnValue(request);
    component.toggleArchive();
    currentUser.set({ id: 'user-2' });
    request.next({ ...mockApp, archivedAt: '2026-04-01' });
    expect(component.application()?.archivedAt).toBeUndefined();
    expect(loaded).not.toHaveBeenCalled();
    expect(toastSpy).not.toHaveBeenCalled();
    appServiceMock.getApplication.mockReturnValue(new Subject<Application>());
    fixture.detectChanges();
    expect(component.application()).toBeNull();
    expect(component.archivePending()).toBe(false);
  });

  it('ignores event deletion callbacks after a session change without reloading or showing a toast', () => {
    const request = new Subject<void>();
    const toastSpy = vi.spyOn(toast, 'success');
    appServiceMock.deleteEvent.mockReturnValue(request);
    component.askDeleteEvent(mockApp.events![0]);
    component.confirmDeleteEvent();
    const loads = appServiceMock.getApplication.mock.calls.length;
    currentUser.set({ id: 'user-2' });
    request.next();
    expect(component.application()?.events).toHaveLength(1);
    expect(appServiceMock.getApplication).toHaveBeenCalledTimes(loads);
    expect(toastSpy).not.toHaveBeenCalled();
    appServiceMock.getApplication.mockReturnValue(new Subject<Application>());
    fixture.detectChanges();
    expect(component.application()).toBeNull();
    expect(component.eventToDelete()).toBeNull();
    expect(component.deletingEvent()).toBe(false);
  });

  it('ignores late detail reads after account changes and older reads in the same account', () => {
    const oldRead = new Subject<Application>();
    const newRead = new Subject<Application>();
    appServiceMock.getApplication.mockReturnValueOnce(oldRead).mockReturnValueOnce(newRead);
    component.loadApplication();
    component.loadApplication();
    newRead.next({ ...mockApp, jobTitle: 'Latest title' });
    oldRead.next(mockApp);
    expect(component.application()?.jobTitle).toBe('Latest title');
    const accountRead = new Subject<Application>();
    appServiceMock.getApplication.mockReturnValue(accountRead);
    component.loadApplication();
    currentUser.set(null);
    accountRead.next(mockApp);
    expect(component.application()?.jobTitle).toBe('Latest title');
    fixture.detectChanges();
    expect(component.application()).toBeNull();
    expect(component.loading()).toBe(false);
  });

  it('keeps the actual confirmation overlay open on deletion failure and allows retry', async () => {
    const request = new Subject<void>();
    appServiceMock.deleteEvent.mockReturnValue(request);
    component.askDeleteEvent(mockApp.events![0]);
    fixture.detectChanges();
    await fixture.whenStable();
    let overlay = document.querySelector('[role="alertdialog"]')!;
    expect(overlay).not.toBeNull();
    expect(overlay.textContent).toContain("won't undo status changes");
    const confirm = overlay.querySelector<HTMLButtonElement>('[data-slot="alert-dialog-action"]')!;
    confirm.click();
    fixture.detectChanges();
    expect(confirm.disabled).toBe(true);
    expect(
      overlay.querySelector<HTMLButtonElement>('[data-slot="alert-dialog-cancel"]')!.disabled
    ).toBe(true);
    request.error(new Error('Unavailable'));
    fixture.detectChanges();
    overlay = document.querySelector('[role="alertdialog"]')!;
    expect(overlay).not.toBeNull();
    expect(overlay.textContent).toContain("Couldn't delete the event");
    expect(confirm.disabled).toBe(false);
    expect(component.application()?.events).toHaveLength(1);
  });
});
