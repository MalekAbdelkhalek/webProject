import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';
import { Category } from './Category';
import { CategoriesResponse } from './CategoriesResponse';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

  constructor(private http: HttpClient) { }
  private apiServerUrl=environment.apiBaseUrl; // Replace this with the actual endpoint URL

  public addSubCategory(category: Category,headers:HttpHeaders): Observable<number>{
    return this.http.post<number>(`${this.apiServerUrl}/api/add/subcategory`, category , { headers });
  }
  public getSubCategories(headers:HttpHeaders): Observable<CategoriesResponse[]>{
    return this.http.get<CategoriesResponse[]>(`${this.apiServerUrl}/api/get/subcategories`, { headers });
  }
  public deleteSubCategory(headers:HttpHeaders,subcategory:string): Observable<number>{
    return this.http.delete<number>(`${this.apiServerUrl}/api/delete/subcategory/${subcategory}`, { headers });
  }
  public deleteCategory(headers:HttpHeaders,category:string): Observable<number>{
    return this.http.delete<number>(`${this.apiServerUrl}/api/delete/category/${category}`, { headers });
  }

}






 
  