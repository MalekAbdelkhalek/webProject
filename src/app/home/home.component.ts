import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
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
import { CategoriesResponse } from '../CategoriesResponse';
import { cloneDeep } from 'lodash';
import { CategoryAndAmount } from '../CategoryAndAmount';
import { SubCatOfHighestCat } from '../subCatOfhighestCat';





interface ExpenseCategory {
  name: string;
  subcategories: string[];
}

interface ExpenseData {
  [key: string]: ExpenseCategory;
}
interface ChartDataPoint {
  label: string;
  y: number;
}

interface ChartOptions {
  animationEnabled: boolean;
  theme: string,
  axisY: {
    includeZero: boolean;
    valueFormatString: string;

  };
  data: {
    type: string;
    yValueFormatString: string,
    indexLabelFontColor: string;
    dataPoints: ChartDataPoint[];
  }[];
}



@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent {
  originExpenseData: ExpenseData = {
    Housing: {
      name: 'Housing',
      subcategories: ['Rent/Mortgage', 'Utilities', 'Home Insurance', 'Property Taxes', 'Maintenance/Repairs'],
    },
    Transportation: {
      name: 'Transportation',
      subcategories: ['Fuel/Gas', 'Public Transportation', 'Car Insurance', 'Maintenance/Repairs', 'Parking Fees'],
    },
    Food: {
      name: 'Food',
      subcategories: ['Groceries', 'Dining Out', 'Takeout/Delivery'],
    },
    Health: {
      name: 'Health',
      subcategories: ['Health Insurance', 'Medical Bills', 'Prescriptions', 'Gym Memberships'],
    },
    Entertainment: {
      name: 'Entertainment',
      subcategories: ['Movies', 'Concerts', 'Subscriptions', 'Hobbies/Activities'],
    },
    PersonalCare: {
      name: 'Personal Care',
      subcategories: ['Haircuts', 'Beauty Products', 'Spa/Massage'],
    },
    Education: {
      name: 'Education',
      subcategories: ['Tuition', 'Books/Supplies', 'Courses/Workshops'],
    },
    Debts: {
      name: 'Debts',
      subcategories: ['Credit Card Payments', 'Loans', 'Other Debts'],
    },
    Savings: {
      name: 'Savings',
      subcategories: ['Emergency Fund', 'Retirement Savings', 'Investments'],
    },
    'Gifts/Donations': {
      name: 'Gifts/Donations',
      subcategories: ['Birthday Gifts', 'Charity Donations', 'Holiday Gifts'],
    },
    Insurance: {
      name: 'Insurance',
      subcategories: ['Life Insurance', 'Car Insurance', 'Home Insurance'],
    },
    Taxes: {
      name: 'Taxes',
      subcategories: ['Income Taxes', 'Property Taxes', 'Sales Taxes'],
    },
    Travel: {
      name: 'Travel',
      subcategories: ['Flights', 'Hotels', 'Rental Cars'],
    },
    Clothing: {
      name: 'Clothing',
      subcategories: ['Apparel', 'Shoes', 'Accessories'],
    },
    Technology: {
      name: 'Technology',
      subcategories: ['Electronics', 'Software', 'Gadgets/Accessories'],
    },
    Pets: {
      name: 'Pets',
      subcategories: ['Pet Food', 'Veterinary Care', 'Supplies'],
    },
    Kids: {
      name: 'Kids',
      subcategories: ['Childcare', 'Toys', 'School Expenses'],
    },
  } as ExpenseData;
  expenseData: ExpenseData = { ...this.originExpenseData };
  categories: string[] = Object.keys(this.expenseData);
  category: string = 'Food';
  subCategory: string = this.expenseData["Food"]?.subcategories[0];

  onCategoryChange() {
    // Reset subCategory when the category changes
    this.subCategory = this.expenseData[this.category]?.subcategories[0] || '';
  }
  
  public onOpenModal( mode: string): void {
    const container = document.getElementById('main-container');
    const button = document.createElement('button');
    button.type = 'button';
    button.style.display = 'none';
    button.setAttribute('data-toggle', 'modal');
    if (mode === 'expense') {
      button.setAttribute('data-target', '#expenseModal');
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
    const button1 = document.getElementById('close-expense');
    button1?.click();
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
    console.log(this.refreshtoken);
    console.log(this.refreshTokenExpired);
  }
  checkAccessTokenExpiration(): void {
    const decodedToken: any = jwtDecode(this.accesstoken);
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const tokenExpiration = decodedToken.exp;
    // Calculate remaining time in seconds
    const remainingTimeInSeconds = tokenExpiration - currentTimestamp;
    
    // Check if the remaining time is less than or equal to 5 seconds
    this.accessTokenExpired = remainingTimeInSeconds <= 5;
    
    if (this.accessTokenExpired) {
      console.log("Token is expiring within 5 seconds.");
    } else {
      console.log("Token is not expiring within 5 seconds.");
    }
    
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
    this.accesstoken = this.tokenService.getAccesstoken();
    this.refreshtoken = this.tokenService.getRefreshtoken();
    console.log("access token: "+this.accesstoken);
    console.log("refresh token: "+this.refreshtoken);
    this.getHighestCategories();
    this.findCurrentUser();    
    this.getLastExpenses();
    this.getSubcategories();
    this.getSubCatOfHighestCat("Food");

    this.getCategories();

      
    // Check accessToken expiration periodically
    setInterval(() => {
      if(!this.accessTokenExpired){
        console.log("15secs")
        this.checkAccessTokenExpiration();
      if(this.accessTokenExpired && !this.refreshTokenExpired){
        this.refreshToken();
      }}
    }, 1000); // Adjust the interval as needed
    
    
    // Check refreshToken expiration periodically
    setInterval(() => {
      if(!this.refreshTokenExpired){
        console.log("120secs")
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
      // Define arrays to store personalized categories and subcategories
personalizedCategories: string[] = [];
personalizedSubcategories: string[] = [];
isCategoryInPersonalized(cat: string): boolean {
  return !!cat && this.personalizedCategories.includes(cat);
}

isSubCategoryInPersonalized(subCat: string): boolean {
  return !!subCat && this.personalizedCategories.includes(subCat);
}


      
public getSubcategories(): void {
  // Set the authorization header with the access token
  const headers = new HttpHeaders({
    Authorization: `Bearer ${this.accesstoken}`,
  });

  this.personalizedCategories = [];
  this.personalizedSubcategories = [];

  this.categoryService.getSubCategories(headers)
    .subscribe(
      (response: CategoriesResponse[]) => {
          // Create a deep copy of originExpenseData
          this.expenseData = cloneDeep(this.originExpenseData);
        for (const item of response) {
          const Category = item.category;

          if (!this.expenseData[Category]) {
            this.expenseData[Category] = { name: item.category, subcategories: item.subcategories };
            this.personalizedCategories.push(item.category);
            this.personalizedSubcategories.push(...item.subcategories);
          } else {
            this.expenseData[Category].subcategories = [
              ...this.expenseData[Category].subcategories,
              ...item.subcategories
            ];
            this.personalizedSubcategories.push(...item.subcategories);
          }
        }
        console.log("oghzr lena");
        console.log(this.personalizedCategories);
        console.log(this.personalizedSubcategories);
        // Update categories array
        this.categories = Object.keys(this.expenseData);
        console.log(this.expenseData);
        console.log(this.originExpenseData);
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
  expense:any;
  addingDate !:Date| undefined;;
  amount :number=0;
  error='';
  public resetExpense(): void {
    this.addingDate = undefined;
    this.amount = 0;
    this.category = 'food';
    this.subCategory = this.expenseData["food"]?.subcategories[0];
    this.personalizedCategory='';
    this.personalizedSubCategory='';
    this.error="";
}

  public addExpense(): void {
        // Set the authorization header with the access token
        const headers = new HttpHeaders({
          Authorization: `Bearer ${this.accesstoken}`,
        });
        this.expenseService.addExpense(this.expense,headers)
          .subscribe(
            (response: number) => {
              console.log(this.expense);
              console.log('leave sent successfully');
              console.log(response);
              this._snackBar.open('Votre demande de congé a été enregistrée avec succès.', '', {
                duration: 3000,
                panelClass: 'custom-snackbar',
                });
    
              this.resetExpense();  
              this.getLastExpenses();
              this.getHighestCategories();
              this.getCategories();
              window.location.reload();


    
            },
            (error: HttpErrorResponse) => {
              alert(error.message);
              console.log('failed to send the leave');
            }
          );
  }
  public onAddExpense(){
    console.log(this.category);;
    if(!this.addingDate || !this.amount){
      this.error="* Please would you fill all the fields *";
    }else{
      if(!this.isDateBeforeTenDays()){
        this.error = "* Please fill the date within the last 10 days *";
      }else if(this.amount<=0){
        this.error="* Please enter a valid amount *";
      }else{
        console.log(this.category);
        console.log(this.subCategory);
        if(this.category==="personalized" ){
          if(!this.personalizedCategory || !this.personalizedSubCategory ){
            this.error="* Please would you fill all the fields *";
          }else{
            this.error="";
            this.expense = {
              addingdate :this.addingDate,
              amount :this.amount,
              category:this.personalizedCategory,
              subcategory:this.personalizedSubCategory
            };
            this.CategoryToAdd = {
              category :this.personalizedCategory,
              subcategory:this.personalizedSubCategory
            };
            this.addExpense();
            this.addSubCategory();
            const button = document.getElementById('close-expense');
            button?.click();
          }
  
        }else if(this.subCategory==="personalized"){
          if(!this.category || !this.personalizedSubCategory ){
            this.error="* Please would you fill all the fields *";
          }else{
            this.expense = {
              addingdate :this.addingDate,
              amount :this.amount,
              category:this.category,
              subcategory:this.personalizedSubCategory
            };
            this.CategoryToAdd = {
              category :this.category,
              subcategory:this.personalizedSubCategory
            };
            console.log(this.expense);
            this.addExpense();
            this.addSubCategory();
            const button = document.getElementById('close-expense');
            button?.click();
          }
        }
         else{
          this.expense = {
            addingdate :this.addingDate,
            amount :this.amount,
            category:this.category,
            subcategory:this.subCategory
          };
          this.addExpense();
          const button = document.getElementById('close-expense');
          button?.click();
  
        }
        
            }
          }

  }
  CategoryToAdd:any;
  personalizedCategory:string='';
  personalizedSubCategory:string='';

  public addSubCategory(): void {
    // Set the authorization header with the access token
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.accesstoken}`,
    });
    
    this.categoryService.addSubCategory(this.CategoryToAdd,headers)
      .subscribe(
        (response: number) => {
          console.log(this.expense);
          console.log('leave sent successfully');
          console.log(response);
          this._snackBar.open('expense added', '', {
            duration: 3000,
            panelClass: 'custom-snackbar',
            });
          this.getSubcategories(); 
        

        },
        (error: HttpErrorResponse) => {
          alert(error.message);
          console.log('failed to add the expense');
        }
      );
  }
  expenses!:Expense[];
  public getLastExpenses(): void {
    // Set the authorization header with the access token
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.accesstoken}`,
    });
    
  
    this.expenseService.getLastExpenses(headers)
      .subscribe(
        (response: Expense[]) => {
          console.log('expenses extracted successfully');
          this.expenses = response.map(expense => ({
            ...expense,
            addingdate: new Date(expense.addingdate),
          }));
          console.log(this.expenses);
        },
        (error: HttpErrorResponse) => {
          alert(error.message);
          console.log('failed to extract the expenses');
        }
      
        );
      }
      isDateBeforeTenDays(): boolean {
        const currentDate = new Date();
      
        // Check if this.addingDate is defined before creating a Date object
        if (this.addingDate instanceof Date) {
          return this.addingDate.getTime() <= currentDate.getTime() && this.addingDate.getTime() >= currentDate.setDate(currentDate.getDate() - 10);
        } else if (typeof this.addingDate === 'string' || typeof this.addingDate === 'number') {
          const inputDate = new Date(this.addingDate);
          const tenDaysAgo = new Date();
          tenDaysAgo.setDate(currentDate.getDate() - 10);
      
          return inputDate.getTime() <= currentDate.getTime() && inputDate.getTime() >= tenDaysAgo.getTime();
        }
      
        // Handle the case where this.addingDate is neither Date, string, nor number
        return false;
      }
      public deleteSubCategory():void{
        // Set the authorization header with the access token
        const headers = new HttpHeaders({
         Authorization: `Bearer ${this.accesstoken}`,
       });
     
       this.categoryService.deleteSubCategory(headers,this.subCategory) // Pass the headers to the HTTP get request
         .subscribe(
           (response: number) => {
             console.log('subcategory deleted succesully');
             console.log(response);
             this._snackBar.open("Your sub-category has been successfully deleted.", '', {
               duration: 3000,
               panelClass: 'custom-snackbar',
               });
               this.getSubcategories();
               this.resetExpense();
           },
           (error: HttpErrorResponse) => {
             alert(error.message);
             console.log('failed to delete the subcategory');
           }
         );
       }
       public deleteCategory():void{
        // Set the authorization header with the access token
        const headers = new HttpHeaders({
         Authorization: `Bearer ${this.accesstoken}`,
       });
     
       this.categoryService.deleteCategory(headers,this.expenseData[this.category].name) // Pass the headers to the HTTP get request
         .subscribe(
           (response: number) => {
             console.log('category deleted succesully');
             console.log(response);
             this._snackBar.open("Your category has been successfully deleted.", '', {
               duration: 3000,
               panelClass: 'custom-snackbar',
               });
               this.getSubcategories();
               this.resetExpense();
           },
           (error: HttpErrorResponse) => {
             alert(error.message);
             console.log('failed to delete the category');
           }
         );
       }
       public deleteExpense(id: string): void {
        // Set the authorization header with the access token
        const headers = new HttpHeaders({
          Authorization: `Bearer ${this.accesstoken}`,
        });
      
        this.expenseService.deleteExpense(id, headers)
          .subscribe(
            (response: number) => {
              console.log('expense deleted successfully.');
              // Refresh the list of leaves after successful deletion (optional)
              this.getLastExpenses();
              this._snackBar.open("Your expense has been successfully deleted.", '', {
                duration: 3000,
                panelClass: 'custom-snackbar',
                });
              this.getCategories();
              window.location.reload();

            },
            (error: HttpErrorResponse) => {
              alert(error.message);
              console.log('Failed to delete the expense.');
            }
          );
 }
 highestCategories!:CategoryAndAmount[];
 public getHighestCategories(): void {
   // Set the authorization header with the access token
   const headers = new HttpHeaders({
     Authorization: `Bearer ${this.accesstoken}`,
   });
   
 
   this.expenseService.getHighestCategories(headers)
     .subscribe(
       (response: CategoryAndAmount[]) => {
         console.log('highest categories extracted successfully');
         console.log(response);

         this.highestCategories=response;
         console.log(this.highestCategories);
         this.onExtractSubCat();

       },
       (error: HttpErrorResponse) => {
         alert(error.message);
         console.log('failed to extract the expenses');
       }
       
     
       );
     }
     categoriesUsed!:CategoryAndAmount[];
     public getCategories(): void {
       // Set the authorization header with the access token
       const headers = new HttpHeaders({
         Authorization: `Bearer ${this.accesstoken}`,
       });
       
     
       this.expenseService.getCategories(headers)
         .subscribe(
           (response: CategoryAndAmount[]) => {
             console.log('categories used extracted successfully');
             console.log(response);
    
             this.categoriesUsed=response;
             console.log(this.categoriesUsed);
             this.updateChartOptions();
    
           },
           (error: HttpErrorResponse) => {
             alert(error.message);
             console.log('failed to extract the expenses');
           }
           
         
           );
         }
     subCatOfHighestCat: { [category: string]: SubCatOfHighestCat[] } = {};
     public getSubCatOfHighestCat(category:string): void {
       // Set the authorization header with the access token
       const headers = new HttpHeaders({
         Authorization: `Bearer ${this.accesstoken}`,
       });
       
     
       this.expenseService.getSubCatOfHighestCat(category,headers)
         .subscribe(
           (response: SubCatOfHighestCat) => {
            if (!this.subCatOfHighestCat[category]) {
              this.subCatOfHighestCat[category] = [];
            }
    
             this.subCatOfHighestCat[category].push(response);           },
           (error: HttpErrorResponse) => {
             alert(error.message);
             console.log('failed to extract the sub categories');
           }
         
           );
         }
     public onExtractSubCat(){
      this.highestCategories.forEach((highestCategory: CategoryAndAmount) => {
        this.getSubCatOfHighestCat(highestCategory.category);
      });
     };
        
    chartOptions: ChartOptions = {
      animationEnabled: false,
     theme: "light2",

      axisY: {
        includeZero: true,
        valueFormatString: "#0dt"

      },
      data: [{
        type: "pie",
        yValueFormatString: "#dt",
        indexLabelFontColor: "#5A5757",
        dataPoints: []
      }]
    };
    chartOptions2: ChartOptions = {

      animationEnabled: false,
      theme: "light2",

      axisY: {
      includeZero: true,
      valueFormatString: "#0dt"
      },
      data: [{
      type: "column", //change type to bar, line, area, pie, etc
      yValueFormatString: "#dt",
      indexLabelFontColor: "#5A5757",
      dataPoints: []
      }]
    }
    fixed=false;
  
    updateChartOptions(): void {
  // Assuming highestCategories is an array with objects having 'category' and 'totalAmount' properties
  this.chartOptions.data[0].dataPoints = this.categoriesUsed.map((category) => ({
    label:category.category,
    y: category.totalAmount,

  }));
  // Assuming this.categoriesUsed is an array of objects with 'category' and 'totalAmount' properties

  // Find the category with the highest total amount
  const highestCategory = this.categoriesUsed.reduce((max, category) => (category.totalAmount > max.totalAmount ? category : max), this.categoriesUsed[0]);
  
  // Find the category with the lowest total amount
  const lowestCategory = this.categoriesUsed.reduce((min, category) => (category.totalAmount < min.totalAmount ? category : min), this.categoriesUsed[0]);
  
  // Update dataPoints array with indexLabel for the highest and lowest categories
  this.chartOptions2.data[0].dataPoints = this.categoriesUsed.map((category) => ({
    label: category.category,
    y: category.totalAmount,
    indexLabel: category === highestCategory ? "Highest\u2191" : (category === lowestCategory ? "Lowest\u2193" : "")
  }));



  this.fixed=true;
     // console.log(this.chartOptions.data);
      console.log(this.chartOptions2.data);

    }
    

  }
      

