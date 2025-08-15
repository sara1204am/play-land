import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Router } from '@angular/router';
import { LoginFooterComponent } from './login-footer/login-footer.component';
import { TranslateModule } from '@ngx-translate/core';
import { LoginService } from './login.service';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    TranslateModule,
    LoginFooterComponent,
    CommonModule,
    ReactiveFormsModule,
    InputTextModule, 
    ButtonModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
 loginForm!: FormGroup;
  private service: LoginService = inject(LoginService);
  private router: Router = inject(Router);


  constructor(
    private fb: FormBuilder,
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
    this.router.navigate(['/home/stock']);
  }

}
