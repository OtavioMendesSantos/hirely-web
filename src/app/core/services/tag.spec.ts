import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TagService } from './tag';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth';
import { signal } from '@angular/core';

describe('TagService', () => {
  let service: TagService;
  let httpMock: HttpTestingController;
  let mockAuthService: any;

  beforeEach(() => {
    mockAuthService = {
      currentUser: signal({ id: 'user-1' })
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        TagService,
        { provide: AuthService, useValue: mockAuthService }
      ]
    });

    service = TestBed.inject(TagService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load tags', () => {
    const mockTags = { tags: [{ id: '1', name: 'Angular', colorHex: '#dd0031' }] };
    
    service.loadTags()?.subscribe();
    
    const req = httpMock.expectOne(`${environment.apiUrl}/users/user-1/tags`);
    expect(req.request.method).toBe('GET');
    req.flush(mockTags);
    
    expect(service.tags()).toEqual(mockTags.tags);
    expect(service.loading()).toBe(false);
  });

  it('should create a tag', () => {
    const newTag = { name: 'React', color_hex: '#61dafb' };
    const createdTag = { id: '2', name: 'React', colorHex: '#61dafb' };
    
    service.createTag(newTag)?.subscribe();
    
    const req = httpMock.expectOne(`${environment.apiUrl}/users/user-1/tags`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newTag);
    req.flush(createdTag);
    
    expect(service.tags()).toContain(createdTag as any);
  });

  it('should delete a tag', () => {
    // Setup initial state
    service.tags.set([{ id: '1', name: 'Angular', colorHex: '#dd0031', userId: 'user-1' }]);
    
    service.deleteTag('1')?.subscribe();
    
    const req = httpMock.expectOne(`${environment.apiUrl}/users/user-1/tags/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
    
    expect(service.tags().length).toBe(0);
  });
});
