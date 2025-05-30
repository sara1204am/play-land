import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/enviroment/environment';

const API_AUTH_URL = `${environment.host}`;

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(
    public readonly http: HttpClient,
  ) { }

  async login(datalogin: any) {
    const headers = {
      'platform-seed': environment.platformSeed
    };
    return await firstValueFrom(
      this.http.post(`${API_AUTH_URL}/login`, datalogin, {
        headers,
      }),
    );
  }

  public setUserToken(data: any): void {
    const appName = 'play-land-sucre';
    const authConf = {
      user: 'user',
      userId: 'userId',
      access: 'access',
      created: 'created',
      ttl: 'ttl',
      id: 'id',
      appName: 'tp41-quickstart',
    };

    if (data && data.userId && data.access) {
      sessionStorage.setItem(
        `${appName}.${authConf.user}`,
        JSON.stringify(data.user),
      );
      const tmp = authConf;
      const toPick = ['userId', 'access', 'createdAt', 'ttl', 'id'];

      const picked = Object.fromEntries(
      Object.entries(tmp).filter(([key]) => toPick.includes(key))
      );
      const keys = Object.values(picked);

      keys.forEach((key) => {
        if (key != 'user' && data[key as keyof any]) {
          sessionStorage.setItem(
            `${appName}.${key}`,
            `${data[key as keyof any]}`,
          );
        }
      });
    }
  }

}
