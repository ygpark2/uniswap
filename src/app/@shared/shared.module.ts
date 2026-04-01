import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionHeaderComponent } from './components/section-header/section-header.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { RouterModule } from '@angular/router';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import { InfiniteScrollModule } from "ngx-infinite-scroll";

import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzProgressModule } from 'ng-zorro-antd/progress';

import { AuthModule } from './modules/auth';
import { LayoutModule } from './modules/layout';
import { LoaderComponent } from './components/loader/loader.component';



@NgModule({
  declarations: [LoaderComponent, SectionHeaderComponent, PageNotFoundComponent],
  imports: [
    CommonModule,
    RouterModule,
    InfiniteScrollModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    NzCardModule,
    NzTableModule,
    NzButtonModule,
    NzDividerModule,
    NzTooltipModule,
    NzTabsModule,
    NzIconModule,
    NzSkeletonModule,
    NzEmptyModule,
    NzPopconfirmModule,
    NzProgressModule,
    NzDescriptionsModule,
    AuthModule,
    LayoutModule
  ],
  exports: [
    LoaderComponent,
    SectionHeaderComponent,
    PageNotFoundComponent,
    InfiniteScrollModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    NzCardModule,
    NzTableModule,
    NzButtonModule,
    NzDividerModule,
    NzTooltipModule,
    NzTabsModule,
    NzIconModule,
    NzSkeletonModule,
    NzEmptyModule,
    NzPopconfirmModule,
    NzProgressModule,
    NzDescriptionsModule,
    AuthModule,
    LayoutModule
  ]
})
export class SharedModule { }
