import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { NzFormTooltipIcon } from 'ng-zorro-antd/form';

import { environment } from '@env/environment';
import { LoggerService } from '@app/@shared/services';
import { AuthenticationService, RegisterContext } from '@app/@shared/modules/auth';

const log = new LoggerService('Login');


@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  error: string | undefined;
  isLoading = false;

  captchaTooltipIcon: NzFormTooltipIcon = {
    type: 'info-circle',
    theme: 'twotone',
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService) {

    }

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      email: [null, [Validators.email, Validators.required]],
      password: [null, [Validators.required]],
      checkPassword: [null, [Validators.required, this.confirmationValidator]],
      name: [null, [Validators.required]],
      nickname: [null, [Validators.required]],
      phoneNumberPrefix: ['+86'],
      phoneNumber: [null, [Validators.required]],
      website: [null, [Validators.required]],
      agree: [false],
    });
  }

  private register(context: RegisterContext) {
    this.isLoading = true;
    const user$ = this.authenticationService.register(context);
    user$
      .pipe(
        finalize(() => {
          this.registerForm.markAsPristine();
          this.isLoading = false;
        })
      )
      .subscribe(
        (user) => {
          log.debug(`${user.name} successfully registered!`);
          this.router.navigate([this.route.snapshot.queryParams['redirect'] || '/login'], { replaceUrl: true });
        },
        (error) => {
          log.debug(`Login error: ${error}`);
          this.error = error;
        }
      );
  }

  submitForm(): void {
    if (this.registerForm.valid) {
      console.log('submit', this.registerForm.value);
      this.authenticationService.register(this.registerForm.value)
    } else {
      Object.values(this.registerForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  updateConfirmValidator(): void {
    /** wait for refresh value */
    Promise.resolve().then(() => this.registerForm.controls['checkPassword'].updateValueAndValidity())
                    .catch((err) => console.error(err));
  }

  confirmationValidator = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { required: true };
    } else if (control.value !== this.registerForm.controls['password'].value) {
      return { confirm: true, error: true };
    }
    return {};
  };

  /*
  getCaptcha(e: MouseEvent): void {
    e.preventDefault();
  }
  */

}
