import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environment/environment';
import { changePasswordForm } from './changePasswordForm';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }
  private apiServerUrl=environment.apiBaseUrl; // Replace this with the actual endpoint URL
  
  login(username: string, password: string) {
    return this.http.post<any>(`${this.apiServerUrl}/api/login`, { username, password });
  }
  refreshToken(headers:HttpHeaders) {
    return this.http.get<any>(`${this.apiServerUrl}/api/token/refresh`, { headers});
  }
  changeCurrentUserPassword(headers:HttpHeaders,changePasswordForm:changePasswordForm){
    return this.http.put<any>(`${this.apiServerUrl}/api/change-password/user`,changePasswordForm, { headers});
  }
  changeUserPassword(headers:HttpHeaders,email:String,changePasswordForm:changePasswordForm){
    return this.http.put<any>(`${this.apiServerUrl}/api/change-password/user/${email}`,changePasswordForm, { headers});
  }
  checkEnable(email: string) {
    return this.http.get<any>(`${this.apiServerUrl}/api/check/${email}`);
  }
}
