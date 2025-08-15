import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Component displayed when accessing a route that doesn't exist in the application.
 * Provides options to go back to the previous page or navigate to the login page.
 *
 * This component handles:
 * - Display of the 404 (Not Found) page
 * - Navigation back to the previous page
 * - Redirection to the login page
 */
@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
})
export class NotFoundComponent {
  /** URL of the previous page */
  public previousUrl: string;
  /** Location service for navigation */
  private location: Location = inject(Location);
  /** Router for navigation */
  private router: Router = inject(Router);

  /**
   * Component constructor
   * Initializes the previous URL with the value of document.referrer
   */
  constructor() {
    this.previousUrl = document.referrer;
  }

  /**
   * Navigates back to the previous page
   *
   * @memberof NotFoundComponent
   */
  public goBack(): void {
    this.location.back();
  }

  /**
   * Navigates to the login page
   *
   * @memberof NotFoundComponent
   */
  public goLogin(): void {
    this.router.navigate(['/login']);
  }
}
