import { Component, effect, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideBriefcase, lucideBuilding, lucideMapPin } from '@ng-icons/lucide';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports, HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmEmptyImports } from '@spartan-ng/helm/empty';
import { AuthService } from '../../core/services/auth';
import { ApplicationService } from '../../core/services/application';
import { AppLayoutComponent } from '../../core/components/app-layout/app-layout';
import { CreateApplicationDialogComponent } from '../../core/components/create-application-dialog/create-application-dialog';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    AppLayoutComponent,
    ...HlmCardImports,
    ...HlmButtonImports,
    ...HlmDialogImports,
    ...HlmEmptyImports,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucidePlus,
      lucideBriefcase,
      lucideBuilding,
      lucideMapPin,
    }),
  ],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialogService = inject(HlmDialogService);
  applicationService = inject(ApplicationService);

  currentUser = this.authService.currentUser;

  constructor() {
    effect(() => {
      if (this.currentUser()) {
        this.applicationService.loadApplications()?.subscribe();
      }
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['action'] === 'new') {
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { action: null },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
        this.openCreateModal();
      }
    });
  }

  openCreateModal() {
    this.dialogService.open(CreateApplicationDialogComponent, {
      contentClass:
        'sm:max-w-xl max-h-[90vh] flex flex-col overflow-hidden bg-surface-container-lowest border border-border-subtle shadow-2xl rounded-2xl',
    });
  }
}
