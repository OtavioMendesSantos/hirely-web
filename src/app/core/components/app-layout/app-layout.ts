import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { HlmBreadcrumbImports } from '@spartan-ng/helm/breadcrumb';
import { AppSidebarComponent } from '../app-sidebar/app-sidebar';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [...HlmSidebarImports, ...HlmBreadcrumbImports, AppSidebarComponent, RouterLink],
  templateUrl: './app-layout.html',
})
export class AppLayoutComponent {
  readonly pageTitle = input<string>('Dashboard');
  readonly breadcrumbItems = input<{ label: string; link?: string }[]>();
}
