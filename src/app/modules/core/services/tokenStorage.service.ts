import { Injectable } from '@angular/core';

import * as crypto from 'crypto-js';

import { UICommon } from '@core/data/UICommon';


@Injectable({
  providedIn: 'root'
})

export class TokenStorageService {

  constructor() { }

  signOut() {
    window.sessionStorage.removeItem(UICommon.JWT_TOKEN_KEY_NAME);
    window.sessionStorage.clear();
  }

  public saveToken(token: string) {
    window.sessionStorage.removeItem(UICommon.JWT_TOKEN_KEY_NAME);
    if (token !== undefined || token != null) {
      window.sessionStorage.setItem(UICommon.JWT_TOKEN_KEY_NAME, crypto.AES.encrypt(token, UICommon.JWT_TOKEN_SECRET_KEY).toString());
    }
  }

  public getToken(): string {
    const token = window.sessionStorage.getItem(UICommon.JWT_TOKEN_KEY_NAME);
    if (token !== undefined && token !== null) {
      return crypto.AES.decrypt(token, UICommon.JWT_TOKEN_SECRET_KEY).toString(crypto.enc.Utf8);
    }
    return null;
  }

  public removeToken(): void {
    window.sessionStorage.removeItem(UICommon.JWT_TOKEN_KEY_NAME);
  }

  public saveLocalSettings(keyString: string, valueString: string): void {
    if (window.localStorage) {
      // localStorage supported
      localStorage.setItem(keyString, valueString);
    }
  }

  public getLocalSettings(keyString: string): string {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (keyString === key) {
        return localStorage.getItem(key);
      }
    }
    return '';
  }
}
