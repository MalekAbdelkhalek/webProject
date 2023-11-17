import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environment/environment';
import { userInfo } from './userInfo';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserInfoService {

  private apiServerUrl=environment.apiBaseUrl;
  constructor(private http: HttpClient) { }

  register(userinfo:userInfo) {
    return this.http.post<any>(`${this.apiServerUrl}/api/register`, userinfo);
  }
  public findCurrentUser(headers:HttpHeaders): Observable<userInfo>{
    return this.http.get<userInfo>(`${this.apiServerUrl}/api/user`, { headers });
  }
  public deleteCurrentUser(headers:HttpHeaders): Observable<void>{
    return this.http.delete<void>(`${this.apiServerUrl}/api/delete/user`, { headers });
  }
  public updateCurrentUser(userinfo:userInfo,headers:HttpHeaders): Observable<void>{
    return this.http.put<void>(`${this.apiServerUrl}/api/update/user`, userinfo, { headers });
  }
  public logoutCurrentUser(headers:HttpHeaders): Observable<void>{
    return this.http.post<void>(`${this.apiServerUrl}/api/logout`, null , { headers });
  }

}
