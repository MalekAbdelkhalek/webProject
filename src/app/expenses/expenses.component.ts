import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { userInfo } from '../userInfo';
import { UserInfoService } from '../user-info.service';
import { TokensService } from '../tokens.service';
import { Router } from '@angular/router';
import {jwtDecode} from 'jwt-decode';
import { UserService } from '../user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { changePasswordForm } from '../changePasswordForm';
import { ExpenseService } from '../expense.service';
import { Expense } from 'src/app/Expense';
import { CategoriesService } from '../categories.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table'; // Import MatTableModule
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

interface ExpenseCategory {
  name: string;
  subcategories: string[];
}
interface ExpenseData {
  [key: string]: ExpenseCategory;
}

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [MatTableModule,CommonModule,MatPaginatorModule,MatSortModule,FormsModule,MatButtonToggleModule],
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.css']
})

export class ExpensesComponent {
  expenseData: ExpenseData = {};
  categories: string[] = [];
  category: string = '';
  subCategory: string = '';
  month:string='';
  year:number=0;

  months: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  years: number[] = Array.from({ length: 24 }, (_, index) => 2023 - index);
  expensesToShow!: Expense[];

  expenses!: Expense[];

  public getAllExpenses(): void {
    // Set the authorization header with the access token
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.accesstoken}`,
    });

    this.expenseService.getAllExpenses(headers)
      .subscribe(
        (response: Expense[]) => {
          console.log('Expenses extracted successfully');
          this.expenses = response.map(expense => ({
            ...expense,
            addingdate: new Date(expense.addingdate),
          }));
          if(this.expenses && !(this.expenses.length === 0)){
            this.NoExpensesToShow=false;
           // Organize expenses into expenseData based on category and subcategories
          this.expenses.forEach(expense => {
            if (!this.expenseData[expense.category]) {
              // If category doesn't exist, create it
              this.expenseData[expense.category] = {
                name: expense.category,
                subcategories: [expense.subcategory]
              };
            } else {
              // If category exists, add subcategory if it doesn't exist
              if (!this.expenseData[expense.category].subcategories.includes(expense.subcategory)) {
                this.expenseData[expense.category].subcategories.push(expense.subcategory);
              }
            }
          });

          // Update categories based on expenseData
          this.categories = Object.keys(this.expenseData);

          // Set default category and subcategory
          this.category =  '';
          this.subCategory = '';

          // Update dataSource with expenses
          this.dataSource.data = this.expenses;
          }else{
            this.NoExpensesToShow=true;
          }


          console.log('Categories:', this.categories);
          console.log('Expense Data:', this.expenseData);
        },
        (error: HttpErrorResponse) => {
          alert(error.message);
          console.log('Failed to extract the expenses');
        }
      );

    }
    public resetFilter(): void {
      this.category = '';
      this.subCategory = '';
      this.month='';
      this.year=0;
  }
    /*onCategoryChange() {
      // Reset subCategory when the category changes
      this.subCategory = this.expenseData[this.category]?.subcategories[0] || '';
    }*/
    NoExpensesToShow=true;
      // Filter and update expensesToShow
      filterExpenses(): void {
        // Copy the original expenses array
        this.expensesToShow = [...this.expenses];
        
        // Filter by year
        if (this.year) {
          this.expensesToShow = this.expensesToShow.filter(expense =>
            expense.addingdate.getFullYear() == this.year
          );
          
        }
        // Filter by month
        if (this.month) {
          this.expensesToShow = this.expensesToShow.filter(expense =>
            expense.addingdate.getMonth() === this.months.indexOf(this.month)
          );
        }
      
        // Filter by category
        if (this.category) {
          this.expensesToShow = this.expensesToShow.filter(expense =>
            expense.category.toLowerCase() === this.category.toLowerCase()
          );
        }
      
        // Filter by subcategory
        if (this.subCategory) {
          this.expensesToShow = this.expensesToShow.filter(expense =>
            expense.subcategory.toLowerCase() === this.subCategory.toLowerCase()
          );
        }
        if(this.expensesToShow && !(this.expensesToShow.length === 0)){
          this.NoExpensesToShow=false;
          this.dataSource.data = this.expensesToShow;
          console.log('expensesToShow:', this.expensesToShow);
        }else{
          this.NoExpensesToShow=true;
        }
        const button = document.getElementById('close-filter');
        button?.click();


      }
      ResetExpenses(): void {
        this.NoExpensesToShow=false;
        this.dataSource.data=this.expenses;
      }
  // Utility function to extract the month from a Date object
  getMonthFromDate(n:number): string {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return monthNames[n];
  }


  displayedColumns: string[] = ['category', 'subcategory', 'amount', 'addingdate'];
  sortedData: Expense[] = [];
  dataSource = new MatTableDataSource<Expense>([]);
  sortColumn: string | undefined;
  sortDirection: 'asc' | 'desc' |'initial' = 'asc';

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  
  public onOpenModal( mode: string): void {
    const container = document.getElementById('main-container');
    const button = document.createElement('button');
    button.type = 'button';
    button.style.display = 'none';
    button.setAttribute('data-toggle', 'modal');
    if (mode === 'filter') {
      button.setAttribute('data-target', '#filterModal');
    }
    if (mode === 'update') {
      button.setAttribute('data-target', '#updateUserModal');
    }
    if (mode === 'logout') {
      button.setAttribute('data-target', '#logoutUserModal');
    }
    if (mode === 'changePassword') {
      button.setAttribute('data-target', '#changePasswordModal');
    }
    if (mode === 'delete') {
      button.setAttribute('data-target', '#deleteUserModal'); 
    }
    container?.appendChild(button);
    button.click();
  }

  showCurrentPassword = false;
  toggleCurrentPasswordVisibility() {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  showNewPassword = false;
  toggleNewPasswordVisibility() {
    this.showNewPassword = !this.showNewPassword;
  }

  isEditMode = false;
  public user!:userInfo;
  sharedData: any;
  accesstoken:any;
  refreshtoken:any;
  constructor(private userinfoService:UserInfoService,private userService:UserService,private expenseService: ExpenseService,private categoryService: CategoriesService,
  private tokenService: TokensService,private http: HttpClient,private router: Router,private _snackBar: MatSnackBar ) {
  }
  public onOpenSessionExpired(): void {
    const container = document.getElementById('session-container');
    const button = document.createElement('button');
    button.type = 'button';
    button.style.display = 'none';
    button.setAttribute('data-toggle', 'modal');
    button.setAttribute('data-target', '#sessionExpiredModal');
    container?.appendChild(button);
    button.click();
  }
  public goToLogin(){
    this.router.navigate(['/']);
  }
 

  refreshTokenExpired=false;
  accessTokenExpired=false;

  checkRefreshTokenExpiration(): void {
    const decodedToken: any = jwtDecode(this.refreshtoken);
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const tokenExpiration = decodedToken.exp;
    this.refreshTokenExpired = (tokenExpiration - currentTimestamp)<=10;
  }
  checkAccessTokenExpiration(): void {
    const decodedToken: any = jwtDecode(this.accesstoken);
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const tokenExpiration = decodedToken.exp;
    // Calculate remaining time in seconds
    const remainingTimeInSeconds = tokenExpiration - currentTimestamp;
    
    // Check if the remaining time is less than or equal to 5 seconds
    this.accessTokenExpired = remainingTimeInSeconds <= 5;

    
  }
  public refreshToken(): void {
    // Set the authorization header with the access token
    
  console.log("token to refresh: "+this.accesstoken);
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.refreshtoken}`,
    });

    this.userService.refreshToken(headers)
    .subscribe(
      (response) => {
        console.log("refresh token: " + this.refreshtoken);
          this.tokenService.setAccessToken(response.accessToken);
          this.accesstoken = this.tokenService.getAccesstoken();
          console.log(this.accesstoken)
          this.accessTokenExpired=false;

      },
      (error: HttpErrorResponse) => {
        alert(error.message);
        console.log('not success');
      }
    );
  }

 
  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    console.log(this.dataSource)
    this.accesstoken = this.tokenService.getAccesstoken();
    this.refreshtoken = this.tokenService.getRefreshtoken();
    console.log("access token: "+this.accesstoken);
    console.log("refresh token: "+this.refreshtoken);
    this.findCurrentUser();    
    this.getAllExpenses();

      
    // Check accessToken expiration periodically
    setInterval(() => {
      if(!this.accessTokenExpired){
        this.checkAccessTokenExpiration();
      if(this.accessTokenExpired && !this.refreshTokenExpired){
        this.refreshToken();
      }}
    }, 1000); // Adjust the interval as needed
    
    
    // Check refreshToken expiration periodically
    setInterval(() => {
      if(!this.refreshTokenExpired){
        this.checkRefreshTokenExpiration();
      if(this.refreshTokenExpired){
        this.onOpenSessionExpired();
        this.accessTokenExpired=true;
        }}
      }, 1000); // Adjust the interval as needed
   
  }
  

    public findCurrentUser(): void {
    // Set the authorization header with the access token
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.accesstoken}`,
    });
    this.userinfoService.findCurrentUser(headers)
      .subscribe(
        (response: userInfo) => {
          this.user = response;
          console.log(response);
        },
        (error: HttpErrorResponse) => {
          alert(error.message);
          console.log('not success');
        }
      );
      }

  public deleteCurrentUser():void{
   // Set the authorization header with the access token
   const headers = new HttpHeaders({
    Authorization: `Bearer ${this.accesstoken}`,
  });

  this.userinfoService.deleteCurrentUser(headers) // Pass the headers to the HTTP get request
    .subscribe(
      (response: void) => {
        console.log('user deleted succesully');
        console.log(response);
        this._snackBar.open("Your account has been successfully deleted. Come back soon!", '', {
          duration: 3000,
          panelClass: 'custom-snackbar',
          });
          this.refreshTokenExpired=true;
          this.accessTokenExpired=true;
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
        console.log('failed to delete the user');
      }
    );
  }
  public onDelete(){
    this.deleteCurrentUser();
    this.router.navigate(['/']);
  }

  public updatecurrentUser(userinfo: userInfo): void {
    // Set the authorization header with the access token
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.accesstoken}`,
    });
    
  
    this.userinfoService.updateCurrentUser(userinfo,headers) // Pass the headers and body directly
      .subscribe(
        (response: void) => {
          console.log('user updated successfully');
          console.log(response);
          this._snackBar.open('Your information has been successfully updated.', '', {
            duration: 3000,
            panelClass: 'custom-snackbar',
            });
        },
        (error: HttpErrorResponse) => {
          alert(error.message);
          console.log('failed to update the user');
        }
      );
  }
  
  userinfo: any;
  public onUpdate(){
    this.userinfo = {
      firstname: this.user.firstname,
      lastname: this.user.lastname,
      birthdate:this.user.birthdate,
      phone: this.user.phone,
      gender:this.user.gender,
    };
    console.log(this.userinfo);
    this.updatecurrentUser(this.userinfo);

  }
  birthdateError=false;

  saveChanges(): void {
    if(new Date(this.user.birthdate).getFullYear() > 2015){
      this.birthdateError=true;

    }else{
    this.onUpdate();
    this.isEditMode = false;
    const button = document.getElementById('close-update');
    button?.click();}
  }
  
  cancelEdit(): void {
    this.findCurrentUser();
    this.isEditMode = false;
  }

  public logoutcurrentUser(): void {
    // Set the authorization header with the access token
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.accesstoken}`,
    });
    
  
    this.userinfoService.logoutCurrentUser(headers) // Pass the headers and body directly
      .subscribe(
        (response: void) => {
          console.log('user logged out successfully');
          console.log(response);
          this._snackBar.open('You have been successfully logged out. Come back soon!', '', {
            duration: 3000,
            panelClass: 'custom-snackbar',
            });
          this.refreshTokenExpired=true;
          this.accessTokenExpired=true;
        },
        (error: HttpErrorResponse) => {
          alert(error.message);
          console.log('failed to log out the user');
        }
      );
  }
  public onLogout(){
    this.logoutcurrentUser();
    this.router.navigate(['']);
  }
 incorrect=false;
 currentPassword: string = '';
 newPassword: string = '';
 changePasswordForm!:changePasswordForm;
 changePasswordError='';
 public changePassword(): void {
  if(!this.currentPassword || !this.newPassword){
    this.changePasswordError="Would you fill all the fields"
  }else {
  // Set the authorization header with the access token
  const headers = new HttpHeaders({
  Authorization: `Bearer ${this.accesstoken}`,
 });
 this.changePasswordForm={
  currentPassword: this.currentPassword,
  newPassword:this.newPassword
 }
 console.log(this.changePasswordForm);
 console.log(this.accesstoken);

 this.userService.changeCurrentUserPassword(headers,this.changePasswordForm)
   .subscribe(
      (response: number) => {
        if(response==1){
        console.log(response);
       console.log('password changed successfully.');
       this._snackBar.open("Your password has been successfully changed.", '', {
        duration: 3000,
        panelClass: 'custom-snackbar',
        });
        const button = document.getElementById('close-password');
        button?.click();
      }else{
        console.log(response);
        console.log('Failed to change the password.');
        this.changePasswordError="Incorrect password entered"
      }
      this.showCurrentPassword= false;  this.showNewPassword=false;this.currentPassword='';this.newPassword='';
    },
      (error: HttpErrorResponse) => {
        console.log('Failed to change the password.');
        this.showCurrentPassword= false;  this.showNewPassword=false;this.currentPassword='';this.newPassword='';
         }  
       );
   
   }  }    



  }
      

