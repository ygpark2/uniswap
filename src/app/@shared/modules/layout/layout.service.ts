import { Routes, Route } from '@angular/router';
import { AuthenticationGuard } from '../auth/authentication.guard';

// import { AuthenticationGuard } from '';
import { LayoutComponent } from './layout.component';

/**
 * Provides helper methods to create routes.
 */
export class LayoutService {
  /**
   * Creates routes using the shell component and authentication.
   * @param routes The routes to add.
   * @return The new route using shell as the base.
   */
  static childRoutes(routes: Routes): Route {
    return {
      path: '',
      component: LayoutComponent,
      children: routes,
      canActivate: [AuthenticationGuard],
    };
  }
}
