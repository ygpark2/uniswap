import { Inject, Injectable, Injector } from '@angular/core';
import {
  GET,
  POST,
  PUT,
  PATCH,
  DELETE,
  BasePath,
  Header,
  Headers,
  Query,
  Queries,
  Field,
  Path,
  Body,
  BaseService,
  ServiceBuilder,
  Response,
} from 'ts-retrofit';

import { Login } from '@app/@shared/models/user/login';
import { User } from '@app/@shared/models/user/user';


@BasePath('/api/v1/users/')
export class AuthApiService extends BaseService {
  
  /*
  constructor(injector: Injector) {
    // super(injector);
  }
  */

  @POST('login')
  async login(@Body login: Login): Promise<Response> {
    return <Response>{};
  }

  @POST('register')
  async register(@Body user: User): Promise<Response> {
    return <Response>{};
  }
}
