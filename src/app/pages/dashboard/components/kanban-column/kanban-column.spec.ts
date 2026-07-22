import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { KanbanColumnComponent } from './kanban-column';
import { Application } from '../../../../core/models/application.model';
import { KanbanColumn } from '../../dashboard';

describe('KanbanColumnComponent', () => {
  let component: KanbanColumnComponent;
  let fixture: ComponentFixture<KanbanColumnComponent>;

  const mockColumn: KanbanColumn = {
    status: 'APPLIED',
    title: 'APPLIED',
    badgeCount: 2,
    badgeClass: 'bg-primary/10 text-primary border-primary/20',
  };

  const mockApps: Application[] = [
    {
      id: '1',
      userId: 'user1',
      companyName: 'Acme Corp',
      jobTitle: 'Frontend Developer',
      status: 'APPLIED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      userId: 'user1',
      companyName: 'Beta Inc',
      jobTitle: 'Backend Developer',
      status: 'APPLIED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KanbanColumnComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(KanbanColumnComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('column', mockColumn);
    fixture.componentRef.setInput('applications', mockApps);
    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();
  });

  it('should create and display column header', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('APPLIED');
    expect(compiled.textContent).toContain('2');
  });

  it('should emit addApplication when add button is clicked', () => {
    const addSpy = vi.spyOn(component.addApplication, 'emit');
    const compiled = fixture.nativeElement as HTMLElement;
    const addButton = compiled.querySelector('button') as HTMLButtonElement;
    addButton.click();
    expect(addSpy).toHaveBeenCalledWith('APPLIED');
  });

  it('should emit applicationDropped when drop list drops an item', () => {
    const dropSpy = vi.spyOn(component.applicationDropped, 'emit');
    const mockDropEvent = {
      previousIndex: 0,
      currentIndex: 1,
      previousContainer: { id: 'APPLIED' },
      container: { id: 'APPLIED' },
      item: { data: mockApps[0] },
    } as any;
    component.applicationDropped.emit(mockDropEvent);
    expect(dropSpy).toHaveBeenCalledWith(mockDropEvent);
  });
});
