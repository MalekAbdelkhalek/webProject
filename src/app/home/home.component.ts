import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { userInfo } from '../userInfo';
import { UserInfoService } from '../user-info.service';
import { TokensService } from '../tokens.service';
import { environment } from 'src/environment/environment';
import { Router } from '@angular/router';
import {jwtDecode} from 'jwt-decode';
import { UserService } from '../user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { changePasswordForm } from '../changePasswordForm';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  public onOpenModal( mode: string): void {
    const container = document.getElementById('main-container');
    const button = document.createElement('button');
    button.type = 'button';
    button.style.display = 'none';
    button.setAttribute('data-toggle', 'modal');
    if (mode === 'dayoff') {
      button.setAttribute('data-target', '#dayoffModal');
    }
    if (mode === 'update') {
      button.setAttribute('data-target', '#updateEmployeeModal');
    }
    if (mode === 'logout') {
      button.setAttribute('data-target', '#logoutEmployeeModal');
    }
    if (mode === 'changePassword') {
      button.setAttribute('data-target', '#changePasswordModal');
    }
    if (mode === 'delete') {
      button.setAttribute('data-target', '#deleteEmployeeModal');
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
  constructor(private userinfoService:UserInfoService,private userService:UserService,
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
    this.router.navigate(['/login']);
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
          console.log(response);
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
    this.findCurrentUser();
    
      // Check refreshToken expiration periodically
      setInterval(() => {
        if(!this.refreshTokenExpired){
        console.log("second")
        this.checkRefreshTokenExpiration();
        if(this.refreshTokenExpired){
          this.onOpenSessionExpired();
          this.accessTokenExpired=true;
        }}
      }, 1000); // Adjust the interval as needed

        // Check accessToken expiration periodically
        setInterval(() => {
          if(!this.accessTokenExpired){
          console.log("second")
          this.checkAccessTokenExpiration();
          if(this.accessTokenExpired && !this.refreshTokenExpired){
            this.refreshToken();
          }}
        }, 1000); // Adjust the interval as needed
   
  }

    public findCurrentUser(): void {
    // Set the authorization header with the access token
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.accesstoken}`,
    });
    console.log(headers);

    this.userinfoService.findCurrentUser(headers)
      .subscribe(
        (response: userInfo) => {
          this.user = response;
          console.log('success');
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
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
        console.log('failed to delete the user');
      }
    );
  }
  public onDelete(){
    this.deleteCurrentUser();
    this.router.navigate(['/login']);
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
  saveChanges(): void {
    this.onUpdate();
    this.isEditMode = false;
    const button = document.getElementById('close-update');
    button?.click();
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
    this.router.navigate(['/login']);
  }
 incorrect=false;
 currentPassword: string = '';
 newPassword: string = '';
 changePasswordForm!:changePasswordForm;
 public changePassword(): void {
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
        this.incorrect=true;
      }
      this.showCurrentPassword= false;  this.showNewPassword=false;this.currentPassword='';this.newPassword='';
    },
      (error: HttpErrorResponse) => {
        console.log('Failed to change the password.');
        this.showCurrentPassword= false;  this.showNewPassword=false;this.currentPassword='';this.newPassword='';
         }  
       );
   
   }     
}
