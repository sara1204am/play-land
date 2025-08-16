import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Router } from '@angular/router';
import { LoginFooterComponent } from './login-footer/login-footer.component';
import { TranslateModule } from '@ngx-translate/core';
import { LoginService } from './login.service';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    TranslateModule,
    LoginFooterComponent,
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    ToastModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginForm!: FormGroup;
  private service: LoginService = inject(LoginService);
  private messageService: MessageService = inject(MessageService);
  private router: Router = inject(Router);
  disabled = false;

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
      this.disabled = true;
      const loginData = this.loginForm.value;
      this.service.login(loginData)
      .then(data => {
         this.messageService.add({
          severity: 'success',
          summary: 'Login',
          detail: 'Datos correctos, ingresando...',
           life: 2000
        });
        this.postLogin(data);
      })
      .catch(()=>{
        this.disabled = false;
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  private postLogin(userData: any): void {
    this.service.setUserToken(userData);
    this.router.navigate(['/home/stock']);
    this.disabled = false;
  }

}
