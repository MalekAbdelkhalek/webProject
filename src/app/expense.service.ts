import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';
import { Expense } from 'src/app/Expense';
import { CategoryAndAmount } from './CategoryAndAmount';
import { SubCatOfHighestCat } from './subCatOfhighestCat';


@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  constructor(private http: HttpClient) { }
  private apiServerUrl=environment.apiBaseUrl; // Replace this with the actual endpoint URL

  public addExpense(expense: Expense,headers:HttpHeaders): Observable<number>{
    return this.http.post<number>(`${this.apiServerUrl}/api/add/expense`, expense , { headers });
  }
  public deleteExpense(id: string,headers:HttpHeaders): Observable<number>{
    return this.http.delete<number>(`${this.apiServerUrl}/api/delete/expense/${id}`, { headers });
  }
  public getCurrentUserLastExpenses(headers:HttpHeaders): Observable<Expense[]>{
    return this.http.get<Expense[]>(`${this.apiServerUrl}/api/get/lastExpenses`, { headers });
  }
  public getHighestCategories(headers:HttpHeaders): Observable<CategoryAndAmount[]>{
    return this.http.get<CategoryAndAmount[]>(`${this.apiServerUrl}/api/get/mostCategories`, { headers });
  }
  public getCategories(headers:HttpHeaders): Observable<CategoryAndAmount[]>{
    return this.http.get<CategoryAndAmount[]>(`${this.apiServerUrl}/api/get/categories`, { headers });
  }
  public getSubCatOfHighestCat(category:string,headers:HttpHeaders): Observable<SubCatOfHighestCat>{
    return this.http.get<SubCatOfHighestCat>(`${this.apiServerUrl}/api/get/subCategories/${category}`, { headers });
  }
}
