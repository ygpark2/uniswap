import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';

import { HomeComponent } from './components/home/home.component';
import { LayoutService } from '@app/@shared/modules/layout';

const routes: Routes = [
  LayoutService.childRoutes([
    { path: 'energy', component: HomeComponent, data: { title: marker('Energy') } },
  ]),
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})
export class EnergyRoutingModule {}
