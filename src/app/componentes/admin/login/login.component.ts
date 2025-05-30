import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginService } from './login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private readonly service: LoginService,
    private readonly router: Router,
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', Validators.required],
    });
  }

  public login(): void {
    if (this.loginForm.valid) {
      const loginData = this.loginForm.value;
        this.service.login(loginData).then(data=>{
          this.postLogin(data);
        });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  private postLogin(userData: any): void {
    this.service.setUserToken(userData);
    this.router.navigate(['/admin']);
  }

}
