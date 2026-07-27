import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth';
import { Tag } from '../models/application.model';

export interface CreateTagRequest {
  name: string;
  color_hex: string;
}

export interface ListTagsResponse {
  tags: Tag[];
}

@Injectable({
  providedIn: 'root',
})
export class TagService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  readonly tags = signal<Tag[]>([]);
  readonly loading = signal<boolean>(false);

  private get userId(): string | null {
    return this.authService.currentUser()?.id ?? null;
  }

  loadTags() {
    const uid = this.userId;
    if (!uid) return;

    this.loading.set(true);
    return this.http
      .get<ListTagsResponse>(`${environment.apiUrl}/users/${uid}/tags`)
      .pipe(
        tap({
          next: (res) => {
            this.tags.set(res.tags || []);
            this.loading.set(false);
          },
          error: () => {
            this.loading.set(false);
          },
        })
      );
  }

  createTag(payload: CreateTagRequest) {
    const uid = this.userId;
    if (!uid) {
      throw new Error('User not authenticated');
    }

    this.loading.set(true);
    return this.http
      .post<Tag>(`${environment.apiUrl}/users/${uid}/tags`, payload)
      .pipe(
        tap({
          next: (created) => {
            this.tags.update((list) => [...list, created]);
            this.loading.set(false);
          },
          error: () => {
            this.loading.set(false);
          },
        })
      );
  }

  deleteTag(tagId: string) {
    const uid = this.userId;
    if (!uid) {
      throw new Error('User not authenticated');
    }

    this.loading.set(true);
    return this.http
      .delete<void>(`${environment.apiUrl}/users/${uid}/tags/${tagId}`)
      .pipe(
        tap({
          next: () => {
            this.tags.update((list) => list.filter((t) => t.id !== tagId));
            this.loading.set(false);
          },
          error: () => {
            this.loading.set(false);
          },
        })
      );
  }
}
