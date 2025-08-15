import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
/* import { TranslateService } from '@ngx-translate/core';
import { PrimeNG } from 'primeng/config';
import { environment } from '../environments/environment'; */
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { PrimeNG } from 'primeng/config';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule],
  providers: [MessageService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private lang =  'es';

  private translate: TranslateService = inject(TranslateService);
  private config: PrimeNG = inject(PrimeNG); 

  constructor() {
   this.translate.use(this.lang);
/*     this._gs.setTheme(this._gs.get_theme);
    this.lang = this._gs.get_language;
    this.translate.addLangs(environment.languages);
    this.translate.setDefaultLang(environment.defaultLang);
    this._gs.setLanguaje(this.lang);
    this.translate
      .get('primeng')
      .subscribe((res) => this.config.setTranslation(res)); */
  }
}
