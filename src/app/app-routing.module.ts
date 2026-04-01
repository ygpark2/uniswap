import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './@shared/modules/layout/layout.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'swap', loadChildren: () => import('./modules/swap/swap.module').then(m => m.SwapModule) },
      { path: '', redirectTo: 'swap', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'swap' }
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
