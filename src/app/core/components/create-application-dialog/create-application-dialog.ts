import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBriefcase,
  lucideBuilding,
  lucideMapPin,
  lucideDollarSign,
  lucideLink,
  lucideCalendar,
  lucideFileText,
  lucidePlus,
  lucideEdit,
  lucideLoader2,
} from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { ApplicationService } from '../../services/application';
import {
  Application,
  ApplicationStatus,
  CreateApplicationRequest,
  UpdateApplicationRequest,
} from '../../models/application.model';

@Component({
  selector: 'app-create-application-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ...HlmButtonImports,
    ...HlmInputImports,
    ...HlmTextareaImports,
    ...HlmLabelImports,
    ...HlmDialogImports,
    ...HlmFieldImports,
    ...HlmSpinnerImports,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideBriefcase,
      lucideBuilding,
      lucideMapPin,
      lucideDollarSign,
      lucideLink,
      lucideCalendar,
      lucideFileText,
      lucidePlus,
      lucideEdit,
      lucideLoader2,
    }),
  ],
  templateUrl: './create-application-dialog.html',
})
export class CreateApplicationDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private applicationService = inject(ApplicationService);
  dialogRef = inject(BrnDialogRef);
  private readonly _dialogContext = injectBrnDialogContext<{ application?: Application } | null>({
    optional: true,
  });

  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  isEditMode = signal(false);
  applicationToEdit = signal<Application | null>(null);

  form = this.fb.group({
    company_name: ['', [Validators.required]],
    job_title: ['', [Validators.required]],
    status: ['APPLIED' as ApplicationStatus, [Validators.required]],
    applied_at: [new Date().toISOString().split('T')[0]],
    job_url: [''],
    location: [''],
    salary_range: [''],
    notes: [''],
    job_description: [''],
  });

  ngOnInit() {
    const app = this._dialogContext?.application;
    if (app) {
      this.isEditMode.set(true);
      this.applicationToEdit.set(app);
      this.form.patchValue({
        company_name: app.companyName,
        job_title: app.jobTitle,
        status: app.status,
        applied_at: app.appliedAt ? app.appliedAt.split('T')[0] : '',
        job_url: app.jobUrl || '',
        location: app.location || '',
        salary_range: app.salaryRange || '',
        notes: app.notes || '',
        job_description: app.jobDescription || '',
      });
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const val = this.form.getRawValue();
    if (this.isEditMode() && this.applicationToEdit()) {
      const payload: UpdateApplicationRequest = {
        company_name: val.company_name!.trim(),
        job_title: val.job_title!.trim(),
        status: val.status as ApplicationStatus,
        applied_at: val.applied_at ? new Date(val.applied_at).toISOString() : undefined,
        job_url: val.job_url?.trim() || undefined,
        location: val.location?.trim() || undefined,
        salary_range: val.salary_range?.trim() || undefined,
        notes: val.notes?.trim() || undefined,
        job_description: val.job_description?.trim() || undefined,
      };

      this.applicationService.updateApplication(this.applicationToEdit()!.id, payload).subscribe({
        next: (updated) => {
          this.isSubmitting.set(false);
          this.dialogRef.close(updated);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(
            err.error?.error?.message || err.error?.message || 'Failed to update job application.'
          );
        },
      });
      return;
    }

    const payload: CreateApplicationRequest = {
      company_name: val.company_name!.trim(),
      job_title: val.job_title!.trim(),
      status: val.status as ApplicationStatus,
      applied_at: val.applied_at ? new Date(val.applied_at).toISOString() : undefined,
      job_url: val.job_url?.trim() || undefined,
      location: val.location?.trim() || undefined,
      salary_range: val.salary_range?.trim() || undefined,
      notes: val.notes?.trim() || undefined,
      job_description: val.job_description?.trim() || undefined,
    };

    this.applicationService.createApplication(payload).subscribe({
      next: (created) => {
        this.isSubmitting.set(false);
        this.dialogRef.close(created);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(
          err.error?.error?.message || err.error?.message || 'Failed to create job application.'
        );
      },
    });
  }
}
