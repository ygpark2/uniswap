import { TestBed, inject } from '@angular/core/testing';

import { AuthenticationGuard, AuthenticationService } from '@app/@shared/auth';
import { MockAuthenticationService } from '@app/@shared/auth/authentication.service.mock';
import { LayoutComponent } from './layout.component';
import { LayoutService } from './layout.service';

describe('Layout', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LayoutComponent],
      providers: [AuthenticationGuard, { provide: AuthenticationService, useClass: MockAuthenticationService }],
    });
  });

  describe('childRoutes', () => {
    it('should create routes as children of Layout', () => {
      // Prepare
      const testRoutes = [{ path: 'test' }];

      // Act
      const result = LayoutService.childRoutes(testRoutes);

      // Assert
      expect(result.path).toBe('');
      expect(result.children).toBe(testRoutes);
      expect(result.component).toBe(LayoutComponent);
    });
  });
});
