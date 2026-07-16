import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SocialAuthButtonsComponent } from './social-auth-buttons';

describe('SocialAuthButtonsComponent', () => {
  let component: SocialAuthButtonsComponent;
  let fixture: ComponentFixture<SocialAuthButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocialAuthButtonsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SocialAuthButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit socialClick when Google or LinkedIn button is clicked', () => {
    let emittedProvider = '';
    component.socialClick.subscribe((provider: string) => {
      emittedProvider = provider;
    });

    const buttons = fixture.nativeElement.querySelectorAll('button');
    buttons[0].click();
    expect(emittedProvider).toBe('Google');

    buttons[1].click();
    expect(emittedProvider).toBe('LinkedIn');
  });
});
