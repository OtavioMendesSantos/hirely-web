import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiKey, ApiKeyService } from '../../core/services/api-key.service';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmEmptyImports } from '@spartan-ng/helm/empty';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideKey, lucideTrash2, lucideCopy, lucideCheck, lucidePlus } from '@ng-icons/lucide';
import { toast } from '@spartan-ng/brain/sonner';
import { AppLayoutComponent } from '../../core/components/app-layout/app-layout';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';

@Component({
  selector: 'app-api-keys',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppLayoutComponent,
    ...HlmCardImports,
    ...HlmButtonImports,
    ...HlmInputImports,
    ...HlmBadgeImports,
    ...HlmLabelImports,
    ...HlmSpinnerImports,
    ...HlmEmptyImports,
    ...HlmAlertDialogImports,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideKey,
      lucideTrash2,
      lucideCopy,
      lucideCheck,
      lucidePlus
    })
  ],
  templateUrl: './api-keys.html',
})
export class ApiKeysPage implements OnInit {
  private apiKeyService = inject(ApiKeyService);

  apiKeys = signal<ApiKey[]>([]);
  isLoading = signal(true);
  
  newKeyName = signal('');
  isCreating = signal(false);
  
  generatedKey = signal<{ name: string; key: string } | null>(null);

  ngOnInit() {
    this.loadKeys();
  }

  loadKeys() {
    this.isLoading.set(true);
    this.apiKeyService.list().subscribe({
      next: (res) => {
        this.apiKeys.set(res.apiKeys || []);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  createKey() {
    if (!this.newKeyName().trim()) return;
    
    this.isCreating.set(true);
    this.apiKeyService.create(this.newKeyName()).subscribe({
      next: (res) => {
        this.generatedKey.set({ name: res.apiKey.Name, key: res.key });
        this.newKeyName.set('');
        this.isCreating.set(false);
        this.loadKeys();
      },
      error: () => {
        this.isCreating.set(false);
      }
    });
  }

  keyToRevoke = signal<string | null>(null);

  openRevokeConfirm(id: string) {
    this.keyToRevoke.set(id);
  }

  cancelRevoke() {
    this.keyToRevoke.set(null);
  }

  onRevokeDialogStateChanged(state: 'open' | 'closed') {
    if (state === 'closed') {
      this.keyToRevoke.set(null);
    }
  }

  confirmRevoke() {
    const id = this.keyToRevoke();
    if (!id) return;

    // Clear the state immediately to close the dialog
    this.keyToRevoke.set(null);

    this.apiKeyService.revoke(id).subscribe({
      next: () => {
        toast.success('API Key revoked successfully');
        this.loadKeys();
      },
      error: () => {
        toast.error('Failed to revoke API Key');
      }
    });
  }

  copyKey() {
    if (this.generatedKey()) {
      navigator.clipboard.writeText(this.generatedKey()!.key);
      toast.success('API Key copied to clipboard!');
    }
  }

  closeGeneratedKey() {
    this.generatedKey.set(null);
  }
}
