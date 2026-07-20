import { TestBed } from '@angular/core/testing';
import { ApplicationService } from './application';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('ApplicationService', () => {
  let service: ApplicationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideRouter([])],
    });
    service = TestBed.inject(ApplicationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
