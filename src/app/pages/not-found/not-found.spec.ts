import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NotFound } from './not-found';

describe('NotFound', () => {
  it('should create and display 404 message', async () => {
    await TestBed.configureTestingModule({
      imports: [NotFound],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(NotFound);
    const component = fixture.componentInstance;
    await fixture.whenStable();

    expect(component).toBeTruthy();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.error-code')?.textContent?.trim()).toBe('404');
    expect(compiled.querySelector('.error-title')?.textContent?.trim()).toBe('Página não encontrada');
  });
});
