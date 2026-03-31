import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { environment } from '@env/environment';
import { LoggerService } from '@app/@shared/services';
import { AuthenticationService } from '@app/@shared/modules/auth';


const log = new LoggerService('Login');

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  version: string | null = environment.version;
  error: string | undefined;
  loginForm!: FormGroup;
  isLoading = false;


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService
  ) {
    this.createForm();

  }

  ngOnInit() {
    // 로그인 페이지 처리
    // this.login();

  }

  private login() {
    this.isLoading = true;
    const login$ = this.authenticationService.login(this.loginForm.value);
    login$
      .pipe(
        finalize(() => {
          this.loginForm.markAsPristine();
          this.isLoading = false;
        })
      )
      .subscribe(
        (credentials) => {
          log.debug(`${credentials.username} successfully logged in`);
          this.router.navigate([this.route.snapshot.queryParams['redirect'] || '/'], { replaceUrl: true });
        },
        (error) => {
          log.debug(`Login error: ${error}`);
          this.error = error;
        }
      );
  }

  private createForm() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      remember: true,
    });
  }

  submitForm(): void {
    if (this.loginForm.valid) {
      console.log('submit', this.loginForm.value);
      this.login();
    } else {
      Object.values(this.loginForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  /*
  kakaoLogin(): void {
    const kakaoAuthUri = this.authenticationService.getKakaoOAuth().getAuthRequestUri(); // print https://kauth.kakao.com/oauth/authorize?

    console.log('kakao authUri : ', kakaoAuthUri);
    kakaoAuthUri.then(authUri => {
      window.location.href = authUri;
    }).catch(reason => {
      console.error("error => ", reason);
    })
  }

  naverLogin(): void {
    const naverAuthUri = this.authenticationService.getNaverOAuth().getAuthRequestUri(); // print https://kauth.kakao.com/oauth/authorize?

    console.log('naver authUri : ', naverAuthUri);
    naverAuthUri.then(authUri => {
      window.location.href = authUri;
    }).catch(reason => {
      console.error("error => ", reason);
    })
  }
  */
}
