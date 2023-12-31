import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserInfoService } from '../user-info.service';
import { TokensService } from '../tokens.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { UserService } from '../user.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  firstname: string = '';
  lastname: string = '';
  password: string = '';
  gender: string = '';
  birthday!: Date;	
  email: string = '';
  phone: string = '';

  showPassword = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  accesstoken!:string;
  refreshtoken!:string;
  sharedData: any;
  form!: FormGroup;
  constructor(private userinfoService:UserInfoService,private userService:UserService,
    private tokenService: TokensService,  private router: Router,private http: HttpClient,
     private _snackBar: MatSnackBar,private fb: FormBuilder) {
  }
  request: any;
  
  ngOnInit(): void {
    /*this.request = {
      firstname: 'amine',
      lastname: 'diden',
      password: 'amine123',
      email: 'amine@gmail.com',
      birthdate:new Date(2003, 6, 15),
      phone: '21352642',
      gender: 'male',
      roles: [
        { id: 2 , name: 'ROLE_USER' },
      ]
    };*/
  
  }
  loading=false;
  waitingForConfirmation=false;
  clicked=false;
  error:string='';
  onclick(){
    this.clicked=true;
    this.request = {
      firstname: this.firstname,
      lastname: this.lastname,
      password: this.password,
      email: this.email,
      birthdate:this.birthday,
      phone: this.phone,
      gender:this.gender,
      roles: [
        { id: 2 , name: "ROLE_USER" },
      ]
      
    }; 
    console.log(this.request);

    if (!this.firstname || !this.lastname || !this.password || !this.gender
       || !this.birthday || !this.email || !this.phone){
      this._snackBar.open("Registration failed. Please fill in all the required fields and try again.", '', {
        duration: 3000,
        panelClass: 'custom-snackbar',
      });
    } else if (this.firstname.length > 20 ) {
      this.error = "* First name cannot exceed 20 characters * ";
    } else if (this.lastname.length > 20 ) {
      this.error = "* Last name cannot exceed 20 characters *";
    } else if (!this.isValidEmail(this.email)) {
      this.error = "* Please enter a valid email address *";
    } else if (this.password.length < 7 || !this.isStrongPassword(this.password)) {
      this.error = "* Password should have a minimum length of 7 characters and include at least one letter, one number, and one special character *";
    } else if (new Date(this.birthday).getFullYear() > 2015) {
      this.error = "* Birthdate cannot be set beyond the year 2015 *";
    }else{
      this.loading=true;
      this.userinfoService.register(this.request).subscribe(
      (response) => {
        if(response.msg_displayed==='failed to sign up'){
          this.error = "* Email or phone already in use *";
          this.loading=false;
          this._snackBar.open("Registration failed. Please verify the provided information and try again.", '', {
            duration: 3000,
            panelClass: 'custom-snackbar',
          });
          console.log('Registration failed' , response);
        }
        else if(response.msg_displayed==='waiting for confirmation'){
        
          this.loading=false;
          this.waitingForConfirmation=true;
          console.log('waiting for confirmation' , response);
          setTimeout(() => {
            this.waitingForConfirmation = false;
          }, 15 * 60  * 1000);
        }
        else if(response.msg_displayed==='signed up successfully'){
          this.loading=false;
          console.log('Registration successful:', response);
          this.accesstoken = response.access_token;
          this.refreshtoken = response.refresh_token;
          console.log("accessToken:", this.accesstoken);
          console.log("refreshToken:", this.refreshtoken);
          this.tokenService.setAccessToken(this.accesstoken);
          this.tokenService.setRefreshToken(this.refreshtoken);
      
          this._snackBar.open('Registration successful! Welcome to our platform.', '', {
            duration: 8000,
            panelClass: 'custom-snackbar',
          });    
          this.router.navigate(['/home']);
        }

      },
      (error) => {
      console.error('Registration failed:', error);
      }
    );
    

    }

}
public checkEnable(): void {
  // Set the authorization header with the access token

  this.userService.checkEnable(this.email)
    .subscribe(
      (response: Boolean) => {
        console.log(response);
        if(response===false){
          this._snackBar.open('Please confirm your email before proceeding.', '', {
            duration: 3000,
            panelClass: 'custom-snackbar',
          });    
        }else{
          this.onclick();
        }
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
        console.log('not success');
      }
    );
    }
isValidEmail(email: string): boolean {
  // Basic email validation using a regular expression
  // You can use a more sophisticated regular expression for more accurate validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

isStrongPassword(password: string): boolean {
  // Password must have a minimum length of 7 characters
  // It must contain at least one letter, one number, and one special character
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{7,}$/;
  return passwordRegex.test(password);
}

}

