import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucidePlus,
  lucideLayoutDashboard,
  lucideActivity,
  lucideUser,
  lucideSun,
  lucideMoon,
  lucideMonitor,
  lucideLogOut,
  lucideChevronsUpDown,
  lucideBriefcase,
} from '@ng-icons/lucide';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { HlmMenubarImports } from '@spartan-ng/helm/menubar';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { AuthService } from '../../services/auth';
import { ThemeService } from '../../services/theme';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    NgIcon,
    ...HlmSidebarImports,
    ...HlmButtonImports,
    ...HlmAlertDialogImports,
    ...HlmMenubarImports,
    ...HlmDropdownMenuImports,
  ],
  providers: [
    provideIcons({
      lucidePlus,
      lucideLayoutDashboard,
      lucideActivity,
      lucideUser,
      lucideSun,
      lucideMoon,
      lucideMonitor,
      lucideLogOut,
      lucideChevronsUpDown,
      lucideBriefcase,
    }),
  ],
  template: `
    <hlm-sidebar variant="inset" collapsible="icon">
      <!-- Top Workspace / Logo Header -->
      <div hlmSidebarHeader class="border-border-subtle/60 border-b py-3">
        <ul hlmSidebarMenu class="m-0 list-none p-0">
          <li hlmSidebarMenuItem class="list-none">
            <a
              routerLink="/"
              hlmSidebarMenuButton
              size="lg"
              class="hover:bg-sidebar-accent group/logo flex cursor-pointer items-center gap-2 transition-colors group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:!p-0"
            >
              <div
                class="bg-primary/10 border-primary/20 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg border font-bold shadow-xs transition-transform group-hover/logo:scale-105"
              >
                <img src="hirely_logo.png" alt="Hirely Logo" class="size-6 object-contain" />
              </div>
              <div
                class="flex flex-1 items-center justify-between overflow-hidden group-data-[collapsible=icon]:hidden"
              >
                <span
                  class="font-heading text-on-surface truncate text-base font-bold tracking-tight"
                  >Hirely</span
                >
              </div>
            </a>
          </li>
        </ul>
      </div>

      <!-- Navigation Menu Content -->
      <div hlmSidebarContent class="py-4">
        <!-- Main Actions / Nav Group -->
        <div hlmSidebarGroup>
          <ul hlmSidebarMenu class="m-0 mt-1 list-none gap-1.5 p-0">
            <!-- New Candidate CTA Button -->
            <li hlmSidebarMenuItem class="list-none">
              <a
                hlmSidebarMenuButton
                routerLink="/dashboard"
                [queryParams]="{ action: 'new' }"
                class="bg-primary text-on-primary hover:bg-primary/90 hover:text-on-primary active:bg-primary/80 active:text-on-primary data-active:bg-primary data-active:text-on-primary group/cta flex items-center gap-2.5 rounded-md py-2.5 font-semibold shadow-sm transition-all duration-150 group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:!p-2"
              >
                <div
                  class="bg-on-primary/20 text-on-primary flex size-6 shrink-0 items-center justify-center rounded-md group-data-[collapsible=icon]:size-4 group-data-[collapsible=icon]:bg-transparent"
                >
                  <ng-icon name="lucidePlus" class="size-4 shrink-0" />
                </div>
                <span class="font-heading tracking-wide group-data-[collapsible=icon]:hidden"
                  >New Candidate</span
                >
              </a>
            </li>

            <!-- Dashboard Item -->
            <li hlmSidebarMenuItem class="list-none">
              <a
                hlmSidebarMenuButton
                routerLink="/dashboard"
                routerLinkActive="bg-sidebar-accent text-primary font-semibold shadow-xs"
                [routerLinkActiveOptions]="{ exact: true }"
                class="text-on-surface-variant hover:text-on-surface flex items-center gap-2.5 py-2.5 transition-colors group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:!p-2"
              >
                <ng-icon name="lucideLayoutDashboard" class="text-primary/80 size-4 shrink-0" />
                <span class="group-data-[collapsible=icon]:hidden">Dashboard</span>
              </a>
            </li>

            <!-- Metrics Item -->
            <li hlmSidebarMenuItem class="list-none">
              <a
                hlmSidebarMenuButton
                routerLink="/metrics"
                routerLinkActive="bg-sidebar-accent text-primary font-semibold shadow-xs"
                class="text-on-surface-variant hover:text-on-surface flex items-center gap-2.5 py-2.5 transition-colors group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:!p-2"
              >
                <ng-icon name="lucideActivity" class="text-primary/80 size-4 shrink-0" />
                <span class="group-data-[collapsible=icon]:hidden">Metrics</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <!-- User Profile & Settings Footer -->
      <div hlmSidebarFooter class="border-border-subtle/60 relative border-t pt-3">
        <div hlmMenubar class="block h-auto w-full border-none bg-transparent p-0 shadow-none">
          <button
            hlmMenubarTrigger
            [hlmMenubarTrigger]="userSubmenu"
            side="top"
            align="start"
            hlmSidebarMenuButton
            size="lg"
            type="button"
            class="hover:bg-sidebar-accent data-[state=open]:bg-sidebar-accent group/user-btn flex w-full cursor-pointer items-center gap-2 overflow-hidden rounded-md p-2 text-start text-sm transition-colors outline-none group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:!p-0"
          >
            <!-- Avatar Initials -->
            <div
              class="bg-primary/15 border-primary/20 text-primary font-heading flex size-8 shrink-0 items-center justify-center rounded-lg border text-xs font-bold"
            >
              {{ userInitials() }}
            </div>
            <div
              class="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden"
            >
              <span class="text-on-surface truncate font-semibold">{{
                currentUser()?.name || 'Recruiter'
              }}</span>
              <span class="text-on-surface-variant/80 truncate text-xs">{{
                currentUser()?.email || 'recruiter@hirely.com'
              }}</span>
            </div>
            <ng-icon
              name="lucideChevronsUpDown"
              class="text-on-surface-variant/60 ms-auto size-4 group-data-[collapsible=icon]:hidden"
            />
          </button>
        </div>

        <!-- User Dropdown Submenu Template -->
        <ng-template #userSubmenu>
          <div
            hlmDropdownMenu
            class="bg-surface-container-lowest border-border-subtle flex min-w-56 flex-col gap-1 rounded-xl border p-1.5 shadow-xl"
          >
            <div
              hlmDropdownMenuLabel
              class="text-on-surface-variant/70 px-2 py-1 text-xs font-semibold tracking-wider uppercase"
            >
              My Account
            </div>

            <a
              routerLink="/profile"
              hlmDropdownMenuItem
              class="text-on-surface hover:bg-surface-container-low flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors"
            >
              <ng-icon name="lucideUser" class="text-primary/80 size-4 shrink-0" />
              <span>Profile</span>
            </a>

            <div hlmDropdownMenuSeparator></div>

            <div
              hlmDropdownMenuLabel
              class="text-on-surface-variant/70 px-2 py-1 text-xs font-semibold tracking-wider uppercase"
            >
              Theme
            </div>

            <button
              type="button"
              hlmDropdownMenuItem
              (click)="themeService.setTheme('light')"
              class="text-on-surface hover:bg-surface-container-low flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors"
            >
              <div class="flex items-center gap-2.5">
                <ng-icon name="lucideSun" class="size-4 shrink-0 text-amber-500" />
                <span>Light</span>
              </div>
              @if (themeService.theme() === 'light') {
                <span class="bg-primary size-1.5 rounded-full"></span>
              }
            </button>

            <button
              type="button"
              hlmDropdownMenuItem
              (click)="themeService.setTheme('dark')"
              class="text-on-surface hover:bg-surface-container-low flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors"
            >
              <div class="flex items-center gap-2.5">
                <ng-icon name="lucideMoon" class="size-4 shrink-0 text-indigo-400" />
                <span>Dark</span>
              </div>
              @if (themeService.theme() === 'dark') {
                <span class="bg-primary size-1.5 rounded-full"></span>
              }
            </button>

            <button
              type="button"
              hlmDropdownMenuItem
              (click)="themeService.setTheme('system')"
              class="text-on-surface hover:bg-surface-container-low flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors"
            >
              <div class="flex items-center gap-2.5">
                <ng-icon name="lucideMonitor" class="text-primary/80 size-4 shrink-0" />
                <span>System</span>
              </div>
              @if (themeService.theme() === 'system') {
                <span class="bg-primary size-1.5 rounded-full"></span>
              }
            </button>

            <div hlmDropdownMenuSeparator></div>

            <button
              type="button"
              hlmDropdownMenuItem
              variant="destructive"
              (click)="openLogoutConfirm()"
              class="text-destructive hover:bg-destructive/10 flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-semibold transition-colors"
            >
              <ng-icon name="lucideLogOut" class="size-4 shrink-0" />
              <span>Log Out</span>
            </button>
          </div>
        </ng-template>

        <!-- Logout Alert Dialog -->
        <hlm-alert-dialog
          #logoutDialog
          [state]="isLogoutConfirmOpen() ? 'open' : 'closed'"
          (stateChanged)="onLogoutDialogStateChanged($event)"
        >
          <hlm-alert-dialog-content *hlmAlertDialogPortal="let ctx">
            <hlm-alert-dialog-header>
              <h2 hlmAlertDialogTitle class="font-heading text-on-surface font-bold">
                Confirm Log Out
              </h2>
              <p
                hlmAlertDialogDescription
                class="font-body text-on-surface-variant leading-relaxed"
              >
                Are you sure you want to log out of your account?
              </p>
            </hlm-alert-dialog-header>
            <hlm-alert-dialog-footer>
              <button hlmAlertDialogCancel type="button" (click)="cancelLogout()">Cancel</button>
              <button hlmAlertDialogAction type="button" (click)="ctx.close(); confirmLogout()">
                Log Out
              </button>
            </hlm-alert-dialog-footer>
          </hlm-alert-dialog-content>
        </hlm-alert-dialog>
      </div>
    </hlm-sidebar>
  `,
})
export class AppSidebarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  themeService = inject(ThemeService);

  currentUser = this.authService.currentUser;
  isLogoutConfirmOpen = signal(false);

  userInitials = computed(() => {
    const name = this.currentUser()?.name || 'Recruiter User';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  });

  openLogoutConfirm() {
    this.isLogoutConfirmOpen.set(true);
  }

  cancelLogout() {
    this.isLogoutConfirmOpen.set(false);
  }

  onLogoutDialogStateChanged(state: string) {
    if (state === 'closed') {
      this.isLogoutConfirmOpen.set(false);
    }
  }

  confirmLogout() {
    this.isLogoutConfirmOpen.set(false);
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
