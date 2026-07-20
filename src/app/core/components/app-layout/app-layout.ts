import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { HlmBreadcrumbImports } from '@spartan-ng/helm/breadcrumb';
import { AppSidebarComponent } from '../app-sidebar/app-sidebar';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [...HlmSidebarImports, ...HlmBreadcrumbImports, AppSidebarComponent, RouterLink],
  template: `
    <div hlmSidebarWrapper class="bg-surface text-on-surface min-h-svh w-full">
      <!-- Main Navigation Sidebar -->
      <app-sidebar />

      <!-- Inset Main Content Area -->
      <main hlmSidebarInset class="bg-background flex min-h-svh flex-1 flex-col transition-all">
        <!-- Top Slim Header Bar with @spartan-ng/helm/breadcrumb -->
        <header
          class="border-border-subtle bg-surface/80 sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b px-4 backdrop-blur-md sm:px-6"
        >
          <!-- Sidebar Toggle Trigger -->
          <button
            hlmSidebarTrigger
            aria-label="Toggle Sidebar"
            class="text-on-surface hover:text-primary -ms-1 cursor-pointer transition-colors"
          >
            <span class="sr-only">Toggle Sidebar</span>
          </button>

          <div class="bg-border-subtle/80 h-4 w-px"></div>

          <!-- Page Title / Breadcrumb using @spartan-ng/helm/breadcrumb -->
          <nav hlmBreadcrumb>
            <ol hlmBreadcrumbList>
              <li hlmBreadcrumbItem>
                <a
                  hlmBreadcrumbLink
                  routerLink="/dashboard"
                  class="text-on-surface-variant/80 hover:text-primary cursor-pointer transition-colors"
                >
                  Workspace
                </a>
              </li>
              <li hlmBreadcrumbSeparator></li>
              <li hlmBreadcrumbItem>
                <span hlmBreadcrumbPage class="font-heading text-on-surface font-bold">{{
                  pageTitle()
                }}</span>
              </li>
            </ol>
          </nav>
        </header>

        <!-- Page Specific Content -->
        <div class="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 md:p-8">
          <ng-content />
        </div>
      </main>
    </div>
  `,
})
export class AppLayoutComponent {
  readonly pageTitle = input<string>('Dashboard');
}
