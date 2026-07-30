import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
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
import { toast } from '@spartan-ng/brain/sonner';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { ApplicationService } from '../../services/application';
import { TagService } from '../../services/tag';
import {
  Application,
  ApplicationStatus,
  CreateApplicationRequest,
  UpdateApplicationRequest,
  ContractType,
} from '../../models/application.model';

@Component({
  selector: 'app-create-application-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    ...HlmButtonImports,
    ...HlmInputImports,
    ...HlmTextareaImports,
    ...HlmLabelImports,
    ...HlmDialogImports,
    ...HlmFieldImports,
    ...HlmSpinnerImports,
    ...HlmBadgeImports,
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
  tagService = inject(TagService);
  dialogRef = inject(BrnDialogRef);
  private readonly _dialogContext = injectBrnDialogContext<{
    application?: Application;
    initialStatus?: ApplicationStatus;
  } | null>({
    optional: true,
  });

  isSubmitting = signal(false);
  isEditMode = signal(false);
  applicationToEdit = signal<Application | null>(null);

  isCreatingTag = signal(false);
  isSavingTag = signal(false);
  newTagName = signal('');
  newTagColor = signal('#4f46e5'); // default indigo

  form = this.fb.group({
    company_name: ['', [Validators.required, Validators.maxLength(255)]],
    job_title: ['', [Validators.required, Validators.maxLength(255)]],
    status: ['APPLIED' as ApplicationStatus, [Validators.required]],
    applied_at: [new Date().toISOString().split('T')[0]],
    job_url: ['', [Validators.pattern(/^https?:\/\/.+/)]],
    location: ['', [Validators.maxLength(255)]],
    salary_range: ['', [Validators.maxLength(100)]],
    contract_type: [''],
    notes: [''],
    job_description: [''],
    tag_ids: [[] as string[]],
  });

  ngOnInit() {
    this.tagService.loadTags()?.subscribe();
    const app = this._dialogContext?.application;
    const initialStatus = this._dialogContext?.initialStatus;
    if (app && app.id) {
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
        contract_type: app.contractType || '',
        notes: app.notes || '',
        job_description: app.jobDescription || '',
        tag_ids: app.tags?.map((t) => t.id) || [],
      });
    } else if (initialStatus || (app && app.status)) {
      this.form.patchValue({
        status: initialStatus || app!.status,
      });
    }
  }

  toggleTag(tagId: string) {
    const current = this.form.get('tag_ids')?.value || [];
    if (current.includes(tagId)) {
      this.form.patchValue({ tag_ids: current.filter((id) => id !== tagId) });
    } else {
      this.form.patchValue({ tag_ids: [...current, tagId] });
    }
  }

  saveNewTag() {
    if (this.isSavingTag()) return;
    const name = this.newTagName().trim();
    if (!name || name.length > 100) {
      this.isCreatingTag.set(false);
      return;
    }

    this.isSavingTag.set(true);
    this.tagService.createTag({ name, color_hex: this.newTagColor() }).subscribe({
      next: (tag) => {
        this.toggleTag(tag.id);
        this.isCreatingTag.set(false);
        this.isSavingTag.set(false);
        this.newTagName.set('');
      },
      error: (err) => {
        this.isSavingTag.set(false);
        const msg = err.error?.error?.message || err.error?.message || 'Failed to create tag.';
        toast.error(msg);
      },
    });
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
        contract_type: (val.contract_type as ContractType) || undefined,
        notes: val.notes?.trim() || undefined,
        job_description: val.job_description?.trim() || undefined,
        tag_ids: val.tag_ids || [],
      };

      this.applicationService.updateApplication(this.applicationToEdit()!.id, payload).subscribe({
        next: (updated) => {
          this.isSubmitting.set(false);
          this.dialogRef.close(updated);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          const msg = err.error?.error?.message || err.error?.message || 'Failed to update job application.';
          toast.error(msg);
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
      contract_type: (val.contract_type as ContractType) || undefined,
      notes: val.notes?.trim() || undefined,
      job_description: val.job_description?.trim() || undefined,
      tag_ids: val.tag_ids || [],
    };

    this.applicationService.createApplication(payload).subscribe({
      next: (created) => {
        this.isSubmitting.set(false);
        this.dialogRef.close(created);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const msg = err.error?.error?.message || err.error?.message || 'Failed to create job application.';
        toast.error(msg);
      },
    });
  }
}
