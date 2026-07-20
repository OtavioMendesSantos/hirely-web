import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateApplicationDialogComponent } from './create-application-dialog';
import { provideHttpClient } from '@angular/common/http';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';

describe('CreateApplicationDialogComponent', () => {
  let component: CreateApplicationDialogComponent;
  let fixture: ComponentFixture<CreateApplicationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateApplicationDialogComponent],
      providers: [
        provideHttpClient(),
        {
          provide: BrnDialogRef,
          useValue: { close: () => {} },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateApplicationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
