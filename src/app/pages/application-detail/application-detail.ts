import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppLayoutComponent } from '../../core/components/app-layout/app-layout';
import { ApplicationDetailContentComponent } from '../../core/components/application-detail-content/application-detail-content';
import { Application } from '../../core/models/application.model';

@Component({
  selector: 'app-application-detail',
  standalone: true,
  imports: [AppLayoutComponent, ApplicationDetailContentComponent],
  templateUrl: './application-detail.html',
})
export class ApplicationDetailPage implements OnInit {
  private route = inject(ActivatedRoute);

  applicationId = signal<string>('');
  pageTitle = signal<string>('Application Details');
  breadcrumbItems = signal<{ label: string; link?: string }[]>([
    { label: 'Dashboard', link: '/dashboard' },
    { label: 'Application Details' },
  ]);

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.applicationId.set(id);
      }
    });
  }

  onApplicationLoaded(app: Application) {
    this.pageTitle.set(app.jobTitle);
    this.breadcrumbItems.set([{ label: 'Dashboard', link: '/dashboard' }, { label: app.jobTitle }]);
  }
}
