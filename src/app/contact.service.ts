import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Contact } from './Contact';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  constructor(private http: HttpClient) { }
  private apiServerUrl=environment.apiBaseUrl; // Replace this with the actual endpoint URL

  public sendMessage(contact: Contact,headers:HttpHeaders): Observable<number>{
    return this.http.post<number>(`${this.apiServerUrl}/api/add/contactMessage`, contact , { headers });
  }
}
