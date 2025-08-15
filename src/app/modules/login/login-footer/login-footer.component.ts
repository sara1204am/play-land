import { Component } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { TranslateModule } from '@ngx-translate/core';

/**
 * LoginFooterComponent displays the footer section in the login page.
 *
 * @export
 * @class LoginFooterComponent
 */
@Component({
  selector: 'login-footer',
  imports: [ TranslateModule ],
  templateUrl: './login-footer.component.html',
})

export class LoginFooterComponent {

    /**
   * The version of the platform application.
   *
   * @memberof LoginComponent
   */
    public platformVersion = environment.platformVersion;

    /**
     * Current year dynamically calculated.
     *
     * @memberof LoginFooterComponent
     */
    public currentYear = new Date().getFullYear();
}
