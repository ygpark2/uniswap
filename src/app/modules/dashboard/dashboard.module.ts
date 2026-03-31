import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '@app/@shared/shared.module';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { HomeComponent } from './components/home/home.component';

import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    SharedModule,
    DashboardRoutingModule,

    NzPageHeaderModule,
    NzIconModule,
    NzCardModule,
    NzTabsModule,
    NzListModule,
    NzSkeletonModule,
  ],
  declarations: [HomeComponent],
})
export class DashboardModule {}
