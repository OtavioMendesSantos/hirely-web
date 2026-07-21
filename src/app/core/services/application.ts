import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth';
import {
  Application,
  ApplicationEvent,
  ApplicationStatsResponse,
  CreateApplicationRequest,
  ListApplicationsResponse,
  UpdateApplicationRequest,
} from '../models/application.model';

@Injectable({
  providedIn: 'root',
})
export class ApplicationService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  readonly applications = signal<Application[]>([]);
  readonly stats = signal<ApplicationStatsResponse | null>(null);
  readonly loading = signal<boolean>(false);

  private get userId(): string | null {
    return this.authService.currentUser()?.id ?? null;
  }

  loadApplications(status?: string, tagIds?: string[]) {
    const uid = this.userId;
    if (!uid) return;

    this.loading.set(true);
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (tagIds && tagIds.length > 0) params = params.set('tag_ids', tagIds.join(','));

    return this.http
      .get<ListApplicationsResponse>(`${environment.apiUrl}/users/${uid}/applications`, { params })
      .pipe(
        tap({
          next: (res) => {
            this.applications.set(res.applications || []);
            this.loading.set(false);
          },
          error: () => {
            this.loading.set(false);
          },
        })
      );
  }

  loadStats() {
    const uid = this.userId;
    if (!uid) return;

    return this.http
      .get<ApplicationStatsResponse>(`${environment.apiUrl}/users/${uid}/applications:stats`)
      .pipe(
        tap((res) => {
          this.stats.set(res);
        })
      );
  }

  createApplication(payload: CreateApplicationRequest) {
    const uid = this.userId;
    if (!uid) {
      throw new Error('User not authenticated');
    }

    this.loading.set(true);
    return this.http
      .post<Application>(`${environment.apiUrl}/users/${uid}/applications`, payload)
      .pipe(
        tap({
          next: (created) => {
            this.applications.update((list) => [created, ...list]);
            this.loading.set(false);
          },
          error: () => {
            this.loading.set(false);
          },
        })
      );
  }

  updateApplication(applicationId: string, payload: UpdateApplicationRequest) {
    const uid = this.userId;
    if (!uid) {
      throw new Error('User not authenticated');
    }

    return this.http
      .patch<Application>(
        `${environment.apiUrl}/users/${uid}/applications/${applicationId}`,
        payload
      )
      .pipe(
        tap((updated) => {
          this.applications.update((list) =>
            list.map((app) => (app.id === applicationId ? updated : app))
          );
        })
      );
  }

  deleteApplication(applicationId: string) {
    const uid = this.userId;
    if (!uid) {
      throw new Error('User not authenticated');
    }

    return this.http
      .delete<void>(`${environment.apiUrl}/users/${uid}/applications/${applicationId}`)
      .pipe(
        tap(() => {
          this.applications.update((list) => list.filter((app) => app.id !== applicationId));
        })
      );
  }

  getApplication(applicationId: string) {
    const uid = this.userId;
    if (!uid) {
      throw new Error('User not authenticated');
    }

    return this.http.get<Application>(
      `${environment.apiUrl}/users/${uid}/applications/${applicationId}`
    );
  }

  addEvent(applicationId: string, description: string) {
    const uid = this.userId;
    if (!uid) {
      throw new Error('User not authenticated');
    }

    return this.http.post<ApplicationEvent>(
      `${environment.apiUrl}/users/${uid}/applications/${applicationId}/events`,
      { description }
    );
  }
}
