import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokensService {

  private readonly accessTokenKey = 'access_token';
  private readonly refreshTokenKey = 'refresh_token';

  getAccesstoken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  getRefreshtoken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  setAccessToken(accesstoken: string): void {
    localStorage.setItem(this.accessTokenKey, accesstoken);
  }
  setRefreshToken(refreshtoken: string): void {
    localStorage.setItem(this.refreshTokenKey, refreshtoken);
  }

  clearData(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
  }
}
