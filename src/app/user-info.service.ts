import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environment/environment';
import { userInfo } from './userInfo';

@Injectable({
  providedIn: 'root'
})
export class UserInfoService {

  private apiServerUrl=environment.apiBaseUrl;
  constructor(private http: HttpClient) { }

  register(userinfo:userInfo) {
    return this.http.post<any>(`${this.apiServerUrl}/api/register`, userinfo);
  }

}
