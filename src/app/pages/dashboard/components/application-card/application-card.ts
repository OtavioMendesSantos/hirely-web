import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBuilding,
  lucideMapPin,
  lucideDollarSign,
  lucideClock,
  lucideEdit,
  lucideMessageSquare,
  lucideBriefcaseBusiness,
} from '@ng-icons/lucide';
import { Application, ApplicationEvent } from '../../../../core/models/application.model';

@Component({
  selector: 'app-application-card',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIcon, DragDropModule],
  providers: [
    provideIcons({
      lucideBuilding,
      lucideMapPin,
      lucideDollarSign,
      lucideClock,
      lucideEdit,
      lucideMessageSquare,
      lucideBriefcaseBusiness,
    }),
  ],
  templateUrl: './application-card.html',
  styleUrls: ['./application-card.scss'],
})
export class ApplicationCardComponent {
  readonly application = input.required<Application>();
  readonly editClick = output<{ application: Application; event: Event }>();

  onCardClick(event: Event) {
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
