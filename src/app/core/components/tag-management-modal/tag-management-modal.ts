import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideTrash, lucideEdit2, lucideX } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';
import { TagService } from '../../services/tag';
import { Tag } from '../../models/application.model';
import { TagColorPickerComponent } from '../../../shared/components/tag-color-picker/tag-color-picker.component';

@Component({
  selector: 'app-tag-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIcon,
    ...HlmButtonImports,
    ...HlmInputImports,
    ...HlmLabelImports,
    ...HlmDialogImports,
    ...HlmAlertDialogImports,
    ...HlmSpinnerImports,
    ...HlmSkeletonImports,
    TagColorPickerComponent,
  ],
  providers: [provideIcons({ lucidePlus, lucideTrash, lucideEdit2, lucideX })],
  templateUrl: 'tag-management-modal.html',
})
export class TagManagementModal implements OnInit {
  tagService = inject(TagService);
  dialogRef = inject(BrnDialogRef);

  newTagName = signal('');
  newTagColor = signal('#EF4444');
  editingTag = signal<Tag | null>(null);

  ngOnInit() {
    this.tagService.loadTags()?.subscribe();
  }

  saveTag() {
    const name = this.newTagName().trim();
    if (!name) return;

    if (this.editingTag()) {
      const oldTag = this.editingTag()!;
      this.tagService.deleteTag(oldTag.id)?.subscribe(() => {
        this.tagService.createTag({ name, color_hex: this.newTagColor() })?.subscribe(() => {
          this.cancelEdit();
        });
      });
    } else {
      this.tagService.createTag({ name, color_hex: this.newTagColor() })?.subscribe(() => {
        this.newTagName.set('');
        this.newTagColor.set('#EF4444');
      });
    }
  }

  editTag(tag: Tag) {
    this.editingTag.set(tag);
    this.newTagName.set(tag.name);
    this.newTagColor.set(tag.colorHex || '#EF4444');
  }

  cancelEdit() {
    this.editingTag.set(null);
    this.newTagName.set('');
    this.newTagColor.set('#EF4444');
  }

  close() {
    this.dialogRef.close();
  }

  deleteTag(id: string) {
    this.tagService.deleteTag(id)?.subscribe(() => {
      this.tagService.loadTags()?.subscribe();
    });
  }
}
