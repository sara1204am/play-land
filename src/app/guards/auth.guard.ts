import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  NavigationExtras,
} from '@angular/router';
import { Observable } from 'rxjs'; 
import { each, isObjectLike, pick, size } from 'lodash-es';
import * as dayjs from 'dayjs';
import ObjectFunctions from '../functions/object.functions';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  private invalidTokenTextValue: string = 'Token invalidated';
  private authConf = {
      user: 'user',
      userId: 'userId',
      access: 'access',
      created: 'created',
      ttl: 'ttl',
      id: 'id',
      appName: 'tp41-quickstart',
    };

  constructor(
    private readonly router: Router,
  ) {
    setTimeout(() => {
      this.invalidTokenTextValue = 'Invalid token'
    }, 100);
  }

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

  public getTokenData(): any {
    const out: any = {};
    each(this.authConf, (v: string | number) => {
      const val = sessionStorage.getItem(`play-land-sucre.${v}`);
      const t = ObjectFunctions.parseJSON(val || '');
      out[v] = isObjectLike(t) || Array.isArray(t) ? t : val;
    });
    return out;
  }


  private async validateToken(state: RouterStateSnapshot): Promise<boolean> {
    const tokenData: any = this.getTokenData();
    const tokenConfig: { [key: string]: keyof any } =
      this.authConf;

    if (tokenData && tokenData[tokenConfig['id']]) {
      const ttl = parseInt(tokenData[tokenConfig['ttl']], 10);
      const tokenCreatedAt = dayjs(tokenData.createdAt).add(ttl, 's');

      if (dayjs().isBefore(tokenCreatedAt)) {
        return true;
      }

      this.redirectTo(undefined, this.invalidTokenTextValue);
      return false;
    }
    this.redirectTo(state.url);
    return false;
  }

  private redirectTo(urlFrom?: string, message?: string): void {
    const loginRoute: string =  '/login';
    const params: NavigationExtras = {};

    if (urlFrom) {
      params.queryParams = { returnUrl: encodeURIComponent(urlFrom) };
    }

    this.router.navigate([loginRoute], params);
  }
}
