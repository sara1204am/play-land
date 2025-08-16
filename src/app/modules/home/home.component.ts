import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { environment } from '../../../environments/environment';

import { BreadcrumbModule } from 'primeng/breadcrumb';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DialogService } from 'primeng/dynamicdialog';

import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterOutlet,
    BreadcrumbModule,
    DialogModule,
    ToastModule,
    CommonModule,
    TranslateModule,
    RouterModule 
  ],
  providers: [MessageService, DialogService],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
isMenuOpen = false;

private router: Router = inject(Router);

  logout(){
    this.clearUserToken()
    this.router.navigate(['./login']);
  }

  public clearUserToken(): void {
  const appName = 'play-land-sucre';
  const authConf = {
    user: 'user',
    userId: 'userId',
    access: 'access',
    created: 'created',
    ttl: 'ttl',
    id: 'id',
  };

  Object.values(authConf).forEach((v) => {
    sessionStorage.removeItem(`${appName}.${v}`);
  });
}


}
