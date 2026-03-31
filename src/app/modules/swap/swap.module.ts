import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { SharedModule } from '@app/@shared/shared.module';
import { SwapRoutingModule } from './swap-routing.module';
import { HomeComponent } from './components/home/home.component';

import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzResultModule } from 'ng-zorro-antd/result';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    SharedModule,
    SwapRoutingModule,
    ReactiveFormsModule,
    FormsModule,

    NzPageHeaderModule,
    NzIconModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzSelectModule,
    NzTypographyModule,
    NzDividerModule,
    NzResultModule,
  ],
  declarations: [HomeComponent],
})
export class SwapModule {}
