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
import { CategoriesService } from '../categories.service';
import { Expense } from '../Expense';
import { formatDate } from '@angular/common';
import { categoryName } from '../categoryName';




@Component({
  selector: 'app-visualisation',
  templateUrl: './visualisation.component.html',
  styleUrls: ['./visualisation.component.css']
})

export class VisualisationComponent {
  
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
   // console.log(this.refreshtoken);
   // console.log(this.refreshTokenExpired);
  }
  checkAccessTokenExpiration(): void {
    const decodedToken: any = jwtDecode(this.accesstoken);
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const tokenExpiration = decodedToken.exp;
    // Calculate remaining time in seconds
    const remainingTimeInSeconds = tokenExpiration - currentTimestamp;
    
    // Check if the remaining time is less than or equal to 5 seconds
    this.accessTokenExpired = remainingTimeInSeconds <= 5;
    
    /*if (this.accessTokenExpired) {
      console.log("Token is expiring within 5 seconds.");
    } else {
      console.log("Token is not expiring within 5 seconds.");
    }*/
    
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
  years: { value:number }[] = [];
  //yearsForCategory: { value:number }[] = [];


  ngOnInit(): void {
    this.accesstoken = this.tokenService.getAccesstoken();
    this.refreshtoken = this.tokenService.getRefreshtoken();
    console.log("access token: "+this.accesstoken);
    console.log("refresh token: "+this.refreshtoken);
    this.findCurrentUser();   
    this.getAllExpenses();  
    this.getCategoriesNames();

      
    // Check accessToken expiration periodically
    setInterval(() => {
      if(!this.accessTokenExpired){
       // console.log("15secs")
        this.checkAccessTokenExpiration();
      if(this.accessTokenExpired && !this.refreshTokenExpired){
        this.refreshToken();
      }}
    }, 1000); // Adjust the interval as needed
    
    
    // Check refreshToken expiration periodically
    setInterval(() => {
      if(!this.refreshTokenExpired){
       // console.log("120secs")
        this.checkRefreshTokenExpiration();
      if(this.refreshTokenExpired){
        this.onOpenSessionExpired();
        this.accessTokenExpired=true;
        }}
      }, 1000); // Adjust the interval as needed

      const currentYear = new Date().getFullYear();

      for (let year = currentYear; year >= 2000; year--) {
        this.years.push({ value: year });
      }
      /*for (let year = currentYear; year >= 2000; year--) {
        this.yearsForCategory.push({ value: year });
      }*/
   
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
    this.birthdateError=false;
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
           const currentYear = new Date().getFullYear();
           this.updateChartOptionsPerMonths(currentYear);
           const currentDate = new Date();
           this.updatechartOptions(currentDate);
           


         },
         (error: HttpErrorResponse) => {
           alert(error.message);
           console.log('Failed to extract the expenses');
         }
       );
     }
    // first chart start 
    currentYear = new Date().getFullYear();
    selectedYear1=this.currentYear;
    chart1: any;
     chartOptionsPerMonths = {
      responsive: true,
      title: {
        text: "Monthly Expenses Data: "+this.selectedYear1
      },
      theme: "dark2",
      animationEnabled: true,
      exportEnabled: true,
      axisY: {
      includeZero: true,
      valueFormatString: "#0dt"
      },
      data: [{
      type: "column", //change type to bar, line, area, pie, etc
      yValueFormatString: "#dt",
      color: "#01b8aa",
      dataPoints: [] as { label: string; y: number }[] 
      }]
    } 
    noExpensesPerMonths=true;
    chart1fixed=false;

    updateChartOptionsPerMonths(year:number): void {
      this.chart1fixed=false
      if (this.expenses) {  
        this.noExpensesPerMonths=false;  
        // Filter expenses for the current year
        const expensesThisYear = this.expenses.filter((expense) => {
          return new Date(expense.addingdate).getFullYear() === year;
        });
    
        // Group expenses by month
        const expensesByMonth: { [month: string]: number } = {};
        expensesThisYear.forEach((expense) => {
          const month = formatDate(expense.addingdate, 'MMMM', 'en-US');
          const capitalizedMonth = this.capitalizeFirstLetter(month);
          expensesByMonth[capitalizedMonth] = (expensesByMonth[capitalizedMonth] || 0) + expense.amount;
        });
        if(expensesByMonth && Object.keys(expensesByMonth).length > 0){
    
        // Create data points for chart and sort by month
        const dataPoints = Object.entries(expensesByMonth)
          .map(([month, amount]) => ({ label: month, y: amount }))
          .sort((a, b) => {
            const monthsOrder = [
              'January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December'
            ];
            return monthsOrder.indexOf(a.label) - monthsOrder.indexOf(b.label);
          });
          console.log(this.chart1fixed);

        // Update chart options
        this.chartOptionsPerMonths.title.text="Monthly Expenses Data: "+this.selectedYear1;
        this.chartOptionsPerMonths.data[0].dataPoints = dataPoints;
        this.chart1.render();
        setInterval(() => {
          if(this.chart1fixed===false){
            this.updateChartOptionsPerMonths(this.selectedYear1);
            setTimeout(() => {
                this.chart1fixed = true;
            }, 2);        }
        }, 0.5);


        }else{
        this.noExpensesPerMonths=true;
      }
      }

    }
    
    capitalizeFirstLetter(str: string): string {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
    getChartInstance1(chart: object) {
      this.chart1 = chart;

    } 
    
    // first chart end

    currentDate = new Date();
    // second chart start
    selectedYear: number = this.currentDate.getFullYear();
    selectedMonth: string = this.currentDate.toLocaleString('en-US', { month: 'long' });
    // Months list
  months: { value: string}[] = [
    { value: 'January' },
    { value: 'February' },
    { value: 'March' },
    { value: 'April' },
    { value: 'May' },
    { value: 'June' },
    { value: 'July' },
    { value: 'August' },
    { value: 'September' },
    { value: 'October' },
    { value: 'November' },
    { value: 'December' }
  ];
    chart: any;
    dps= [] as { x: number; y: number }[] ;

    chartOptions = {
      responsive: true,
      exportEnabled: true,
      title: {
      text: this.selectedMonth+" "+this.selectedYear
      },
      theme: "dark2",
      axisY: {
        includeZero: true,
        valueFormatString: "#0dt"
        },
      data: [{
      yValueFormatString: "#0dt",
      type: "line",
      dataPoints: this.dps
      }]
    }
    noExpensesPerMonth=true;
    chart2fixed=false;
        public updatechartOptions(date:Date){
          if(this.expenses){
            const currentMonthExpenses = this.expenses.filter(expense => {
              const expenseDate = new Date(expense.addingdate);
              return expenseDate.getMonth() === date.getMonth() && expenseDate.getFullYear() === date.getFullYear();
            });   
            if(currentMonthExpenses && Object.keys(currentMonthExpenses).length > 0){     
              this.noExpensesPerMonth=false;
              const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
              // Initialize an array of data points with zeros
              const dps = Array.from({ length: daysInMonth }, (_, index) => ({ x: index + 1, y: 0 }));
              
              // Populate dps with actual expense data
              currentMonthExpenses.forEach(expense => {
                const day = new Date(expense.addingdate).getDate();
                dps[day - 1].y += expense.amount; // Assuming your expense object has an 'amount' property
              });
              this.dps = dps;
              this.chartOptions.data[0].dataPoints = this.dps;
              this.chartOptions.title.text=this.selectedMonth+" "+this.selectedYear;
      

              // Now dps contains the data you need
              console.log("dps : "+dps.map(obj => JSON.stringify(obj)));}else{
                this.noExpensesPerMonth=true;
              }

          }
    
          
          
        }
getChartInstance(chart: object) {
  this.chart = chart;
  this.updateChartData(); // Initial chart data update
}

public updateChartData(): void {
  this.chart2fixed = false;
  const year = Number(this.selectedYear);
  // Map month names to their corresponding numeric values
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const month = monthNames.indexOf(this.selectedMonth);

  console.log("month: " + month);
  console.log("year: " + year);

  if (!isNaN(year) && month !== -1) {
    const selectedDate = new Date(year, month);

    // Update chart title
    this.chartOptions.title.text = this.selectedMonth + " " + this.selectedYear;
    this.updatechartOptions(selectedDate);
    setInterval(() => {
      if(this.chart2fixed===false){
        this.updateChartData();
        setTimeout(() => {
            this.chart2fixed = true;
        }, 2);        }
    }, 0.5);

    // Render the updated chart
    this.chart.render();
  } else {
    console.error("Invalid year or month");
  }    

}
      // second chart end


 // third chart start
selectedYearForCategory:number= 0 ;
selectedMonthForCategory: string = "";
categories!:categoryName[];
selectedCategory: string ='Food';

public getCategoriesNames(): void {
  // Set the authorization header with the access token
  const headers = new HttpHeaders({
    Authorization: `Bearer ${this.accesstoken}`,
  });
  

  this.expenseService.getCategoriesNames(headers)
    .subscribe(
      (response: categoryName[]) => {

        console.log('subCategories used extracted successfully');
        console.log(response);

        this.categories=response;
        if(this.categories){
          this.selectedCategory= this.categories.length > 0 ? this.categories[0].category : '';
          this.getExpensesByCategory();

        }
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
        console.log('failed to extract the expenses');
      }
      
    
      );
    }


 exepnsesByCategory!:Expense[];
 public getExpensesByCategory(): void {
   // Set the authorization header with the access token
   const headers = new HttpHeaders({
     Authorization: `Bearer ${this.accesstoken}`,
   });
   
 
   this.expenseService.getExpensesByCategory(this.selectedCategory,headers)
     .subscribe(
       (response: Expense[]) => {

         console.log('subCategories used extracted successfully');
         console.log(response);
         this.exepnsesByCategory=response;
         this.updatechartOptionsPieAndBar();

       },
       (error: HttpErrorResponse) => {
         alert(error.message);
         console.log('failed to extract the expenses');
       }
       
     
       );
     }
     chartPie: any;
     chartBar: any;



chartOptions1 = {
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
    dataPoints: [] as { label: string; y: number }[] 
  }]
};
chartOptions2 = {

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
  dataPoints: [] as { label: string; y: number }[] 
  }]
}
getChartInstancePie(chart: object) {
  this.chartPie = chart;
  this.updatechartOptionsPieAndBar(); // Initial chart data update
}
getChartInstanceBar(chart: object) {
  this.chartBar = chart;
  this.updatechartOptionsPieAndBar(); // Initial chart data update
}
chart3fixed=false;
noExpensesPerCategory=true;
updatechartOptionsPieAndBar(): void {
  this.chart3fixed=false;
  if (this.exepnsesByCategory) {
    console.log(this.selectedMonthForCategory);
    console.log(this.selectedYearForCategory);
    // Filter expenses for the selected month and year
    const expensesThisMonth = this.exepnsesByCategory.filter((expense) => {
      const expenseDate = new Date(expense.addingdate);
      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];


      return (
        (this.selectedMonthForCategory === "" || expenseDate.getMonth() === monthNames.indexOf(this.selectedMonthForCategory)) &&
        (this.selectedYearForCategory === 0 || expenseDate.getFullYear() === this.selectedYearForCategory)
      );
    });
    console.log(expensesThisMonth);


    // Group expenses by subcategory
    const expensesBySubcategory: { [subcategory: string]: number } = {};
    expensesThisMonth.forEach((expense) => {
      const subcategory = expense.subcategory;
      expensesBySubcategory[subcategory] = (expensesBySubcategory[subcategory] || 0) + expense.amount;
    });
    if(expensesBySubcategory){
      this.noExpensesPerCategory=false;
    // Create data points for both pie and bar charts
    const dataPointsPie: { label: string; y: number }[] = Object.entries(expensesBySubcategory).map(([subcategory, totalAmount]) => ({
      label: subcategory,
      y: totalAmount,
     }));
 
     const dataPointsBar: { label: string; y: number }[] = Object.entries(expensesBySubcategory).map(([subcategory, totalAmount]) => ({
      label: subcategory,
      y: totalAmount,
     }));
     console.log(dataPointsBar);
 
 
     // Update chart options for pie chart
     this.chartOptions1.data[0].dataPoints = dataPointsPie;
 
     // Update chart options for bar chart
     this.chartOptions2.data[0].dataPoints = dataPointsBar;
 
     setInterval(() => {
      if(this.chart3fixed===false){
        this.updatechartOptionsPieAndBar();
        setTimeout(() => {
            this.chart3fixed = true;
        }, 2);        }
    }, 0.5);
 
     // Render the charts
     this.chartPie.render();
     this.chartBar.render();
 
     this.noExpensesPerCategory = dataPointsPie.length === 0; // Check if there are no expenses
   }else{
    this.noExpensesPerCategory=true;
   }
  }


}







}



    


