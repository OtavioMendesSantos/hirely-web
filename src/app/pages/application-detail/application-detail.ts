import { Component, effect, inject, OnInit, signal, untracked } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppLayoutComponent } from '../../core/components/app-layout/app-layout';
import { ApplicationDetailContentComponent } from '../../core/components/application-detail-content/application-detail-content';
import { AuthService } from '../../core/services/auth';
import { Application } from '../../core/models/application.model';

@Component({
  selector: 'app-application-detail',
  standalone: true,
  imports: [AppLayoutComponent, ApplicationDetailContentComponent],
  templateUrl: './application-detail.html',
})
export class ApplicationDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);
  private context: string | undefined;

  applicationId = signal<string>('');
  pageTitle = signal<string>('Application Details');
  breadcrumbItems = signal<{ label: string; link?: string }[]>([
    { label: 'Dashboard', link: '/dashboard' },
    { label: 'Application Details' },
  ]);

  constructor() {
    effect(() => {
      const context = `${this.auth.currentUser()?.id ?? ''}:${this.applicationId()}`;
      if (context === this.context) return;
      this.context = context;
      untracked(() => {
        this.pageTitle.set('Application Details');
        this.breadcrumbItems.set([
          { label: 'Dashboard', link: '/dashboard' },
          { label: 'Application Details' },
        ]);
      });
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.applicationId.set(id);
      }
    });
  }

  onApplicationLoaded(app: Application) {
    if (app.userId !== this.auth.currentUser()?.id || app.id !== this.applicationId()) return;
    this.pageTitle.set(app.jobTitle);
    this.breadcrumbItems.set([
      {
        label: app.archivedAt ? 'Archived' : 'Dashboard',
        link: app.archivedAt ? '/archived' : '/dashboard',
      },
      { label: app.jobTitle },
    ]);
  }
}
