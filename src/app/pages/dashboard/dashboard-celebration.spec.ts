import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Subject } from 'rxjs';
import { vi } from 'vitest';
import { Dashboard } from './dashboard';
import { ApplicationService } from '../../core/services/application';
import { AuthService } from '../../core/services/auth';
import { TagService } from '../../core/services/tag';
import { CelebrationService } from '../../core/services/celebration';
import { Application, GroupedApplications } from '../../core/models/application.model';

describe('Dashboard acceptance celebration', () => {
  it.each([true, false])(
    'celebrates only after successful persistence (success: %s)',
    (success) => {
      const application: Application = {
        id: 'application-a',
        userId: 'a',
        companyName: 'Acme',
        jobTitle: 'Developer',
        status: 'OFFER',
        createdAt: '',
        updatedAt: '',
      };
      const grouped: GroupedApplications = {
        TO_APPLY: [],
        APPLIED: [],
        INTERVIEW: [],
        OFFER: [application],
        ACCEPTED: [],
        REJECTED: [],
        OTHER: [],
      };
      const response = new Subject<Application>();
      const applicationService = {
        applications: signal([application]),
        groupedApplications: signal(grouped),
        updateApplication: vi.fn(() => response),
      };
      const celebrateAcceptance = vi.fn();
      TestBed.configureTestingModule({
        providers: [
          provideRouter([]),
          { provide: AuthService, useValue: { currentUser: signal(null) } },
          { provide: ApplicationService, useValue: applicationService },
          { provide: TagService, useValue: {} },
          { provide: CelebrationService, useValue: { celebrateAcceptance } },
        ],
      });
      const component = TestBed.createComponent(Dashboard).componentInstance;
      component.onApplicationDrop({
        previousContainer: { id: 'OFFER' },
        container: { id: 'ACCEPTED' },
        previousIndex: 0,
        currentIndex: 0,
        item: { data: application },
      } as unknown as CdkDragDrop<Application[]>);
      expect(applicationService.applications()[0].status).toBe('ACCEPTED');
      expect(celebrateAcceptance).not.toHaveBeenCalled();
      if (success) {
        response.next({ ...application, status: 'ACCEPTED' });
        expect(celebrateAcceptance).toHaveBeenCalledExactlyOnceWith('OFFER', 'ACCEPTED');
      } else {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {
          /* Expected API failure. */
        });
        response.error(new Error('Save failed'));
        expect(celebrateAcceptance).not.toHaveBeenCalled();
        expect(applicationService.applications()[0].status).toBe('OFFER');
        consoleError.mockRestore();
      }
    }
  );
});
