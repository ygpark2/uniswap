import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: 'swap', loadChildren: () => import('./modules/swap/swap.module').then(m => m.SwapModule) },
  // Fallback when no prior route is matched
  { path: '**', redirectTo: 'swap', pathMatch: 'full' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
    }),
  ],
  exports: [RouterModule],
  providers: [],
})
export class AppRoutingModule {}
