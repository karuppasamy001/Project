import { TestBed } from '@angular/core/testing';

import { CouchDBService } from './couch-db.service';

describe('CouchDBService', () => {
  let service: CouchDBService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CouchDBService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
