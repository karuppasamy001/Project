import { TestBed } from '@angular/core/testing';

import { VideoRefreshService } from './video-refresh.service';

describe('VideoRefreshService', () => {
  let service: VideoRefreshService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VideoRefreshService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
