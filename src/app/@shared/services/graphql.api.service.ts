import { Apollo, ApolloBase, gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import { map, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';

interface ApolloQueryResult {
  data: string;
}


@Injectable({
  providedIn: 'root'
})
export class GraphqlApiService {
  private apollo: ApolloBase;

  constructor(private apolloProvider: Apollo) {
    console.log("-------------------------- GraphqlApiService log --------------------------");
    this.apollo = this.apolloProvider.use('fmGraphqlClient');
  }

  getData(): Observable<ApolloQueryResult> {
    return this.apollo.watchQuery({
      query: gql`
        {
          rates(currency: "USD") {
            currency
            rate
          }
        }
      `,
    }).valueChanges.pipe(map(result => (result.data && result.data) as ApolloQueryResult));
  }
}
