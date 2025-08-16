import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    Router,
    NavigationExtras,
} from '@angular/router';
import { each, isObjectLike } from 'lodash';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AuthGuard {
    private invalidTokenTextValue: string = 'Token invalidated';

    constructor(
        private readonly router: Router,
    ) {}

    canActivateChild(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot,
    ): Observable<boolean> | Promise<boolean> | boolean {
        return this.validateToken(state);
    }

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot,
    ): Observable<boolean> | Promise<boolean> | boolean {
        return this.validateToken(state);
    }

    private async validateToken(state: RouterStateSnapshot): Promise<boolean> {
        const tokenData: any = this.getTokenData();
        if (tokenData.id) {
            return true;
        }

        /*     const tokenConfig: any =
              this.config.get('authConf');
        
            if (tokenData && tokenData[tokenConfig['id']]) {
              const ttl = parseInt(tokenData[tokenConfig['ttl']], 10);
              const tokenCreatedAt = dayjs(tokenData.createdAt).add(ttl, 's');
        
              if (dayjs().isBefore(tokenCreatedAt)) {
                return true;
              }
        
              this.redirectTo(undefined, this.invalidTokenTextValue);
              return false;
            } */
        this.redirectTo(state.url);
        return false;

    }

    private redirectTo(urlFrom?: string, message?: string): void {
        if (message) {
            console.log(message);
        }

        const loginRoute: string = '/login';
        const params: NavigationExtras = {};

        if (urlFrom) {
            params.queryParams = { returnUrl: encodeURIComponent(urlFrom) };
        }

        this.router.navigate([loginRoute], params);
    }

    public getTokenData(): any {
        const out: any = {};
        const appName = 'play-land-sucre';
        const authConf = {
            user: 'user',
            userId: 'userId',
            access: 'access',
            created: 'created',
            ttl: 'ttl',
            id: 'id',
            appName: 'play-land',
        };
        
        Object.values(authConf).forEach((v) => {
            const val = sessionStorage.getItem(`${appName}.${v}`);
            const t = this.parseJSON(val || '');
            out[v] = (typeof t === 'object' && t !== null) || Array.isArray(t) ? t : val;
        });
        return out;
    }

    parseJSON(str: string): any {
        try {
            return JSON.parse(str);
        } catch (e) {
            return null;
        }
    }
}
