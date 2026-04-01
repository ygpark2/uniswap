import { NgModule, inject } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { ServiceWorkerModule } from '@angular/service-worker';
import { RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { provideNamedApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';

import { AppComponent } from './app.component';
import { SharedModule } from '@app/@shared/shared.module';
import { AppRoutingModule } from '@app/app-routing.module';

import { SwapModule } from '@app/modules/swap/swap.module';

import { environment } from '@env/environment';
import { NzConfig, NZ_CONFIG } from 'ng-zorro-antd/core/config';
import { HttpClientModule } from '@angular/common/http';


const ngZorroConfig: NzConfig = {
  message: { nzTop: 120 },
  notification: { nzTop: 240 }
};

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ServiceWorkerModule.register('./ngsw-worker.js', { enabled: environment.production }),
    FormsModule,
    HttpClientModule,
    RouterModule,
    TranslateModule.forRoot(),
    InfiniteScrollModule,
    SharedModule,
    AppRoutingModule,
  ],
  providers: [
    {
      provide: NZ_CONFIG,
      useValue: ngZorroConfig,
    },
    /*
    provideNamedApollo(() => {
      const httpLink = inject(HttpLink);
      return {
        fmGraphqlClient: {
          cache: new InMemoryCache(),
          link: httpLink.create({
            uri: 'https://o5x5jzoo7z.sse.codesandbox.io/graphql',
          }),
        },
      };
    }),
    */
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
