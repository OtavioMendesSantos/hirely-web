import { TestBed } from '@angular/core/testing';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';
import { Subject } from 'rxjs';
import { vi } from 'vitest';
import { CreateApplicationDialogComponent } from './create-application-dialog';
import { ApplicationService } from '../../services/application';
import { TagService } from '../../services/tag';
import { CelebrationService } from '../../services/celebration';
import { Application } from '../../models/application.model';

describe('Application edit celebration', () => {
  it.each([true, false])(
    'waits for a successful save before celebrating (success: %s)',
    (success) => {
      const original: Application = {
        id: 'application-a',
        userId: 'a',
        jobTitle: 'Developer',
        companyName: 'Acme',
        status: 'OFFER',
        createdAt: '',
        updatedAt: '',
      };
      const response = new Subject<Application>();
      const celebrateAcceptance = vi.fn();
      TestBed.configureTestingModule({
        providers: [
          { provide: ApplicationService, useValue: { updateApplication: vi.fn(() => response) } },
          { provide: TagService, useValue: {} },
          { provide: BrnDialogRef, useValue: { close: vi.fn() } },
          { provide: CelebrationService, useValue: { celebrateAcceptance } },
        ],
      });
      const component = TestBed.createComponent(CreateApplicationDialogComponent).componentInstance;
      component.applicationToEdit.set(original);
      component.isEditMode.set(true);
      component.form.patchValue({
        company_name: 'Acme',
        job_title: 'Developer',
        status: 'ACCEPTED',
      });
      component.onSubmit();
      expect(component.isSubmitting()).toBe(true);
      expect(celebrateAcceptance).not.toHaveBeenCalled();
      if (success) {
        response.next({ ...original, status: 'ACCEPTED' });
        expect(celebrateAcceptance).toHaveBeenCalledExactlyOnceWith('OFFER', 'ACCEPTED');
      } else {
        response.error(new Error('Save failed'));
        expect(celebrateAcceptance).not.toHaveBeenCalled();
      }
      expect(component.isSubmitting()).toBe(false);
    }
  );
});
