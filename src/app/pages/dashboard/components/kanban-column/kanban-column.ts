import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePartyPopper, lucideBriefcase, lucidePlus } from '@ng-icons/lucide';
import { HlmEmptyImports } from '@spartan-ng/helm/empty';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { Application, ApplicationStatus } from '../../../../core/models/application.model';
import { KanbanColumn } from '../../dashboard';
import { ApplicationCardComponent } from '../application-card/application-card';

@Component({
  selector: 'app-kanban-column',
  standalone: true,
  imports: [
    CommonModule,
    ScrollingModule,
    DragDropModule,
    ...HlmSkeletonImports,
    ...HlmEmptyImports,
    NgIcon,
    ApplicationCardComponent,
  ],
  providers: [
    provideIcons({
      lucidePartyPopper,
      lucideBriefcase,
      lucidePlus,
    }),
  ],
  templateUrl: './kanban-column.html',
  styleUrls: ['./kanban-column.scss'],
})
export class KanbanColumnComponent {
  readonly column = input.required<KanbanColumn>();
  readonly applications = input.required<Application[]>();
  readonly loading = input.required<boolean>();

  readonly editApplication = output<{ application: Application; event: Event }>();
  readonly addApplication = output<ApplicationStatus>();
  readonly applicationDropped = output<CdkDragDrop<Application[]>>();

  readonly emptyStateDescriptions: Record<ApplicationStatus, string> = {
    TO_APPLY: 'No saved roles',
    APPLIED: 'No applications',
    INTERVIEW: 'No interviews',
    OFFER: 'No offers',
    ACCEPTED: 'No accepted offers',
    REJECTED: 'No rejections',
    OTHER: 'No other applications',
  };

  trackByAppId(index: number, app: Application): string {
    return app.id;
  }
}
