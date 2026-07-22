import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ApplicationCardComponent } from './application-card';
import { Application } from '../../../../core/models/application.model';

describe('ApplicationCardComponent', () => {
  let component: ApplicationCardComponent;
  let fixture: ComponentFixture<ApplicationCardComponent>;

  const mockApp: Application = {
    id: '101',
    userId: 'user1',
    companyName: 'Acme Corp',
    jobTitle: 'Senior Frontend Engineer',
    status: 'APPLIED',
    location: 'Remote',
    salaryRange: '$120k - $150k',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationCardComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicationCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('application', mockApp);
    fixture.detectChanges();
  });

  it('should create and render application details', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Senior Frontend Engineer');
    expect(compiled.textContent).toContain('Acme Corp');
    expect(compiled.textContent).toContain('Remote');
    expect(compiled.textContent).toContain('$120k - $150k');
  });

  it('should emit editClick on card click', () => {
    const editClickSpy = vi.spyOn(component.editClick, 'emit');
    const compiled = fixture.nativeElement as HTMLElement;
    const cardDiv = compiled.querySelector('div.cursor-pointer') as HTMLElement;
    cardDiv.click();
    expect(editClickSpy).toHaveBeenCalledWith(expect.objectContaining({ application: mockApp }));
  });
});
