import { Injectable } from '@angular/core';
import { AuthApiService } from '@app/@shared/services/auth.api.service';
import { Observable, of, from } from 'rxjs';
import { ServiceBuilder } from 'ts-retrofit';

// import { RequestInterceptor, ResponseInterceptor } from '@app/@shared/http';
import { Credentials, CredentialsService } from './credentials.service';
import { User } from '@app/@shared/models/user/user';

import { Router } from '@angular/router';

export interface LoginContext {
  username: string;
  password: string;
  remember?: boolean;
}

export interface LoginData {
  username: string;
  token: string;
  remember?: boolean;
}

export interface RegisterContext {
  email: string;
  password: string;
  checkPassword: string;
  name: string;
  nickname: string;
  phoneNumberPrefix: string;
  phoneNumber: string;
  website: string;
  agree: boolean;
}

/**
 * Provides a base for authentication workflow.
 * The login/logout methods s^1.0.0hould be replaced with proper implementation.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private authApiService: AuthApiService;

  constructor(
    private router: Router,
    private credentialsService: CredentialsService,
  ) {
    this.authApiService = new ServiceBuilder()
      // .setEndpoint('http://localhost:8090')
      // .setStandalone(true)
      // .setRequestInterceptors(RequestInterceptor)
      // .setResponseInterceptors(ResponseInterceptor)
      .build(AuthApiService);
  }

  /**
   * Authenticates the user.
   * @param context The login parameters.
   * @return The user credentials.
   */
  login(context: LoginContext): Observable<Credentials> {
    // Replace by proper authentication call
    console.log('context.username -> ', context.username);
    console.log('context.password -> ', context.password);
    return from(
      this.authApiService
        .login({ username: context.username, password: context.password })
        .then((response) => {
          console.log('------------------- response ----------------------');
          console.log(response);
          const credentials = {
            username: context.username,
            token: response.headers['authorization'],
          } as Credentials;
          this.credentialsService.setCredentials(credentials, context.remember);
          return credentials;
        })
        .finally(() => {}),
    );
    // return of(data);
  }

  oauthLogin(credentials: Credentials): Observable<Credentials> {
    this.credentialsService.setCredentials(credentials, true);
    this.router.navigate(['/home'], { queryParams: {}, replaceUrl: true });
    return of(credentials);
  }

  /**
   * Authenticates the user.
   * @param context The login parameters.
   * @return The user credentials.
   */
  register(context: RegisterContext): Observable<User> {
    // Replace by proper authentication call
    const userData = {
      id: '',
      name: context.name,
      nickName: context.nickname,
      email: context.email,
      phoneNumber: context.phoneNumberPrefix + ' ' + context.phoneNumber,
      website: context.website,
      password: context.password,
    };
    return from(
      this.authApiService.register(userData).then((response) => {
        console.log('------------------- response ----------------------');
        console.log(response);
        return response.data as User;
      }),
    );
    // return of(data);
  }

  /**
   * Logs out the user and clear credentials.
   * @return True if the user was logged out successfully.
   */
  logout(): Observable<boolean> {
    // Customize credentials invalidation here
    this.credentialsService.setCredentials();
    this.router.navigate(['/home'], { queryParams: {}, replaceUrl: true });
    return of(true);
  }
}
