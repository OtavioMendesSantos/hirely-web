import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface ApiKey {
  ID: string;
  UserID: string;
  Name: string;
  UsageCount: number;
  LastIP: string | null;
  LastUserAgent: string | null;
  LastUsedAt: string | null;
  Revoked: boolean;
  CreatedAt: string;
}

export interface CreateApiKeyResponse {
  apiKey: ApiKey;
  key: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApiKeyService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/users/me/api-keys`;

  list(): Observable<{ apiKeys: ApiKey[] }> {
    return this.http.get<{ apiKeys: ApiKey[] }>(this.url);
  }

  create(name: string): Observable<CreateApiKeyResponse> {
    return this.http.post<CreateApiKeyResponse>(this.url, { name });
  }

  revoke(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
