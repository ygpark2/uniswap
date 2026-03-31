import { Component, OnInit } from '@angular/core';
import { EventSourceService } from '@app/@shared/services/event-source.service';

import { Subscription, take, map, from } from 'rxjs';
import { MessageData } from '@app/@shared/models/message_data'
import { UserProfile } from '@app/@shared/models/user/user_profile';
import { Post } from '@app/@shared/models/post/post';
import { GraphqlApiService } from '@app/@shared/services/graphql.api.service';


@Component({
  selector: 'dashboard-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  initLoading = true;
  isLoading = false;
  private pageLimit = 10;

  tabs: string[] = [ 'hot', 'trending', 'promoted', 'created' ];  // [ 'hot', 'promoted', 'trending', 'votes', 'created' ];

  userDataMap = new Map<string | undefined, UserProfile>();

  tabDataMap = new Map<string, MessageData<Post>[]>([
    ['hot', []],
    ['promoted', []],
    ['trending', []],
    ['votes', []],
    ['created', []]
  ]);


  constructor(
    private graphqlApiService: GraphqlApiService
  ) {
    // inpage.js:28927 TypeError: Cannot read properties of undefined (reading '0')
    console.log("------------------- home component ---------------------");
    // this.graphqlApiService.getData();
  }

  ngOnInit(): void {
    this.initLoading = false;
    this.isLoading = false;
  }

  onBack() {

  }

  edit(item: any): void {
    // this.msg.success(item.email);
  }

  onLoadMore(tab: string) {
    console.log("scrolled!! tab -----------------------------> ", tab);
  }

}


