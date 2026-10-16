import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth';
import {
  Application,
  ApplicationEvent,
  ApplicationQueryParams,
  ApplicationStatsResponse,
  CreateApplicationRequest,
  GroupedApplications,
  GroupedApplicationsResponse,
  ListApplicationsResponse,
  UpdateApplicationRequest,
} from '../models/application.model';

@Injectable({
  providedIn: 'root',
})
export class ApplicationService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private groupedGeneration = 0;

  readonly applications = signal<Application[]>([]);
  readonly groupedApplications = signal<GroupedApplications>({
    TO_APPLY: [],
    APPLIED: [],
    INTERVIEW: [],
    OFFER: [],
    ACCEPTED: [],
    REJECTED: [],
    OTHER: [],
  });
  readonly nextPageToken = signal<string | undefined>(undefined);
  readonly stats = signal<ApplicationStatsResponse | null>(null);
  readonly loading = signal<boolean>(false);

  private get userId(): string | null {
    return this.authService.currentUser()?.id ?? null;
  }

  private buildHttpParams(params?: ApplicationQueryParams): HttpParams {
    let httpParams = new HttpParams();
    if (!params) return httpParams;

    if (params.archive_state) httpParams = httpParams.set('archive_state', params.archive_state);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.tag_ids && params.tag_ids.length > 0)
      httpParams = httpParams.set('tag_ids', params.tag_ids.join(','));
    if (params.order_by) httpParams = httpParams.set('order_by', params.order_by);
    if (params.order) httpParams = httpParams.set('order', params.order);
    if (params.page_size) httpParams = httpParams.set('page_size', params.page_size.toString());
    if (params.page_token) httpParams = httpParams.set('page_token', params.page_token);
    if (params.search) httpParams = httpParams.set('search', params.search);

    return httpParams;
  }

  /** A read without side effects: archive pagination must not replace the Kanban state. */
  queryApplications(params: ApplicationQueryParams) {
    const uid = this.userId;
    if (!uid) throw new Error('User not authenticated');
    return this.http.get<ListApplicationsResponse>(
      `${environment.apiUrl}/users/${uid}/applications`,
      { params: this.buildHttpParams(params) }
    );
  }

  archiveApplication(applicationId: string) {
    return this.changeArchiveState(applicationId, 'archive');
  }

  restoreApplication(applicationId: string) {
    return this.changeArchiveState(applicationId, 'restore');
  }

  private changeArchiveState(applicationId: string, action: 'archive' | 'restore') {
    const uid = this.userId;
    if (!uid) throw new Error('User not authenticated');
    return this.http
      .post<Application>(
        `${environment.apiUrl}/users/${uid}/applications/${applicationId}/${action}`,
        {}
      )
      .pipe(
        tap(() => {
          this.groupedGeneration++;
          // Keep active queries intact; their owners reload with their current filters.
          this.applications.update((list) => list.filter((app) => app.id !== applicationId));
          this.groupedApplications.update(
            (current) =>
              Object.fromEntries(
                Object.entries(current).map(([status, list]) => [
                  status,
                  list.filter((app) => app.id !== applicationId),
                ])
              ) as GroupedApplications
          );
        })
      );
  }

  loadApplications(params?: ApplicationQueryParams) {
    const uid = this.userId;
    if (!uid) return;

    this.loading.set(true);
    const httpParams = this.buildHttpParams(params);

    return this.http
      .get<ListApplicationsResponse>(`${environment.apiUrl}/users/${uid}/applications`, {
        params: httpParams,
      })
      .pipe(
        tap({
          next: (res) => {
            this.applications.set(res.applications || []);
            this.nextPageToken.set(res.next_page_token || undefined);
            this.loading.set(false);
          },
          error: () => {
            this.loading.set(false);
          },
        })
      );
  }

  loadGroupedApplications(params?: ApplicationQueryParams) {
    const generation = ++this.groupedGeneration;
    const uid = this.userId;
    if (!uid) return;

    this.loading.set(true);
    const httpParams = this.buildHttpParams(params);

    return this.http
      .get<GroupedApplicationsResponse>(
        `${environment.apiUrl}/users/${uid}/applications/grouped-by-status`,
        { params: httpParams }
      )
      .pipe(
        tap({
          next: (res) => {
            if (generation !== this.groupedGeneration) return;
            const grouped: GroupedApplications = res.grouped_applications || {
              TO_APPLY: [],
              APPLIED: [],
              INTERVIEW: [],
              OFFER: [],
              ACCEPTED: [],
              REJECTED: [],
              OTHER: [],
            };
            this.groupedApplications.set(grouped);
            this.nextPageToken.set(res.next_page_token || undefined);
            const allApps = Object.values(grouped).flat();
            this.applications.set(allApps);
            this.loading.set(false);
          },
          error: () => {
            this.loading.set(false);
          },
        })
      );
  }

  loadStats(start_date?: string, end_date?: string) {
    const uid = this.userId;
    if (!uid) return;

    let httpParams = new HttpParams();
    if (start_date) httpParams = httpParams.set('start_date', start_date);
    if (end_date) httpParams = httpParams.set('end_date', end_date);

    return this.http
      .get<ApplicationStatsResponse>(`${environment.apiUrl}/users/${uid}/applications/stats`, {
        params: httpParams,
      })
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
            this.groupedApplications.update((current) => {
              const status = created.status || 'OTHER';
              const targetArray = current[status] || current['OTHER'] || [];
              return {
                ...current,
                [status]: [created, ...targetArray],
              };
            });
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
          this.groupedApplications.update((current) => {
            const status = (updated.status || 'OTHER') as keyof GroupedApplications;
            const next: GroupedApplications = {
              TO_APPLY: [],
              APPLIED: [],
              INTERVIEW: [],
              OFFER: [],
              ACCEPTED: [],
              REJECTED: [],
              OTHER: [],
            };
            for (const [key, list] of Object.entries(current)) {
              if (key === status) {
                const existingIndex = list.findIndex((app) => app.id === applicationId);
                if (existingIndex !== -1) {
                  const targetList = [...list];
                  targetList[existingIndex] = updated;
                  next[key as keyof GroupedApplications] = targetList;
                } else {
                  next[key as keyof GroupedApplications] = [updated, ...list];
                }
              } else {
                next[key as keyof GroupedApplications] = list.filter(
                  (app) => app.id !== applicationId
                );
              }
            }
            return next;
          });
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
          this.groupedApplications.update((current) => {
            const next: GroupedApplications = {
              TO_APPLY: [],
              APPLIED: [],
              INTERVIEW: [],
              OFFER: [],
              ACCEPTED: [],
              REJECTED: [],
              OTHER: [],
            };
            for (const [key, list] of Object.entries(current)) {
              next[key as keyof GroupedApplications] = list.filter(
                (app) => app.id !== applicationId
              );
            }
            return next;
          });
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

  deleteEvent(applicationId: string, eventId: string) {
    const uid = this.userId;
    if (!uid) throw new Error('User not authenticated');
    return this.http
      .delete<void>(
        `${environment.apiUrl}/users/${uid}/applications/${applicationId}/events/${eventId}`
      )
      .pipe(
        tap(() => {
          const removeEvent = (application: Application) =>
            application.id === applicationId
              ? {
                  ...application,
                  events: application.events?.filter((event) => event.id !== eventId),
                }
              : application;
          this.applications.update((list) => list.map(removeEvent));
          this.groupedApplications.update(
            (current) =>
              Object.fromEntries(
                Object.entries(current).map(([status, list]) => [status, list.map(removeEvent)])
              ) as GroupedApplications
          );
          this.stats.set(null);
        })
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
