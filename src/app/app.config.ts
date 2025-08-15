import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';

import { MyPreset } from './theme';
import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';
import {
  HttpBackend,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
/* import { AuthInterceptor } from './core/services/auth.interceptor'; */
import { provideNgIdleKeepalive } from '@ng-idle/keepalive';
import { providePrimeNG } from 'primeng/config';

export function HttpLoaderFactory(_httpBackend: HttpBackend) {
  return new MultiTranslateHttpLoader(_httpBackend, [
    '/assets/i18n/'
  ]);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideNgIdleKeepalive(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
 /*    provideHttpClient(withInterceptors([AuthInterceptor])), */
    provideHttpClient(),
    providePrimeNG({
      theme: {
        preset: MyPreset,
        options: {
          darkModeSelector: '.dark',
          cssLayer: {
            name: 'primeng',
            order: 'theme, base, primeng',
          },
        },
      },
    }),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpBackend],
        },
      }),
    ),
  ],
};
