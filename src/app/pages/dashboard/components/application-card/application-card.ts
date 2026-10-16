import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideMoreHorizontal,
  lucideBuilding,
  lucideMapPin,
  lucideDollarSign,
  lucideClock,
  lucideEdit,
  lucideEye,
  lucidePencil,
  lucideArchive,
  lucideTrash2,
  lucideMessageSquare,
  lucideBriefcaseBusiness,
  lucideHourglass,
  lucideMonitor,
} from '@ng-icons/lucide';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { Application, ApplicationEvent } from '../../../../core/models/application.model';

@Component({
  selector: 'app-application-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NgIcon,
    DragDropModule,
    ...HlmDropdownMenuImports,
    ...HlmButtonImports,
    ...HlmCardImports,
  ],
  providers: [
    provideIcons({
      lucideMoreHorizontal,
      lucideBuilding,
      lucideMapPin,
      lucideDollarSign,
      lucideClock,
      lucideEdit,
      lucideEye,
      lucidePencil,
      lucideArchive,
      lucideTrash2,
      lucideMessageSquare,
      lucideBriefcaseBusiness,
      lucideHourglass,
      lucideMonitor,
    }),
  ],
  templateUrl: './application-card.html',
  styleUrls: ['./application-card.scss'],
})
export class ApplicationCardComponent {
  readonly application = input.required<Application>();
  readonly archivePending = input(false);
  readonly editClick = output<{ application: Application; event: Event }>();

  readonly archiveClick = output<Application>();
  readonly deleteClick = output<Application>();

  onCardKeydown(event: Event) {
    if (event.target === event.currentTarget) this.onCardClick(event);
  }

  onCardClick(event: Event) {
    if (event.target instanceof Element && event.target.closest('.drag-handle')) return;
    this.editClick.emit({ application: this.application(), event });
  }

  onEditButtonClick(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.editClick.emit({ application: this.application(), event });
  }

  getLatestEvent(): ApplicationEvent | undefined {
    const app = this.application();
    if (!app.events || app.events.length === 0) return undefined;
    return app.events[app.events.length - 1];
  }

  get waitTimeDays(): number | null {
    const app = this.application();
    if (app.status !== 'APPLIED') return null;

    const referenceDateStr = app.updatedAt || app.createdAt;
    if (!referenceDateStr) return null;

    const referenceDate = new Date(referenceDateStr);

    const now = new Date();
    const utcNow = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    const utcRef = Date.UTC(
      referenceDate.getFullYear(),
      referenceDate.getMonth(),
      referenceDate.getDate()
    );

    const diffDays = Math.floor((utcNow - utcRef) / (1000 * 60 * 60 * 24));

    return diffDays >= 0 ? diffDays : 0;
  }

  get waitTimeTooltip(): string | null {
    const days = this.waitTimeDays;
    if (days === null) return null;

    if (days >= 30) return '30 days without response';
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days} days without response`;
  }

  getEventSnippet(event: ApplicationEvent): { text: string; dotClass: string; textClass: string } {
    if (event.type === 'MANUAL') {
      return {
        text: event.description,
        dotClass: 'bg-primary',
        textClass: 'text-on-surface-variant font-medium',
      };
    }
    if (event.description.toLowerCase().includes('interview')) {
      return {
        text: event.description,
        dotClass: 'bg-destructive',
        textClass: 'text-destructive font-semibold',
      };
    }
    if (event.previousStatus && event.newStatus) {
      return {
        text: `Changed to ${event.newStatus}`,
        dotClass: 'bg-primary',
        textClass: 'text-on-surface-variant font-medium',
      };
    }
    return {
      text: event.description,
      dotClass: 'bg-on-surface-variant/40',
      textClass: 'text-on-surface-variant/80',
    };
  }

  formatTimeAgo(dateString?: string): string {
    if (!dateString) return 'Awaiting Date';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays <= 0) {
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHours <= 0) return 'Just now';
        return `Added ${diffHours}h ago`;
      }
      if (diffDays === 1) return 'Added 1d ago';
      if (diffDays < 7) return `Added ${diffDays}d ago`;
      const diffWeeks = Math.floor(diffDays / 7);
      if (diffWeeks === 1) return 'Added 1w ago';
      if (diffWeeks < 4) return `Added ${diffWeeks}w ago`;
      return `Added ${date.toLocaleDateString()}`;
    } catch {
      return 'Added recently';
    }
  }
}
