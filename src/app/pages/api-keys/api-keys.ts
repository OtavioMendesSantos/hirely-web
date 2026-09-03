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
import { AppLayoutComponent } from '../../core/components/app-layout/app-layout';

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
        this.generatedKey.set({ name: res.apiKey.name, key: res.key });
        this.newKeyName.set('');
        this.isCreating.set(false);
        this.loadKeys();
      },
      error: () => {
        this.isCreating.set(false);
      }
    });
  }

  revokeKey(id: string) {
    if (!confirm('Are you sure you want to revoke this API Key? It will stop working immediately.')) {
      return;
    }

    this.apiKeyService.revoke(id).subscribe({
      next: () => {
        this.loadKeys();
      }
    });
  }

  copyKey() {
    if (this.generatedKey()) {
      navigator.clipboard.writeText(this.generatedKey()!.key);
      alert('API Key copied to clipboard!');
    }
  }

  closeGeneratedKey() {
    this.generatedKey.set(null);
  }
}
