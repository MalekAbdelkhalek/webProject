import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserInfoService } from '../user-info.service';
import { TokensService } from '../tokens.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';

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
  constructor(private userinfoService:UserInfoService,
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
  fail=false;
  clicked=false;
      
  onclick(email:string,phone:string){
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
      console.log("error12");
      this._snackBar.open("Registration failed. Please fill in all the required fields and try again.", '', {
        duration: 3000,
        panelClass: 'custom-snackbar',
      });
    }else{
    this.userinfoService.register(this.request).subscribe(
      (response) => {
        if(response.msg_displayed==='failed to sign up'){
          this._snackBar.open("Registration failed. Please verify the provided information and try again.", '', {
            duration: 3000,
            panelClass: 'custom-snackbar',
          });
          console.log('Registration failed' , response);
          this.fail=true;
        }
        else{
         
          console.log('Registration successful:', response);
          this.accesstoken = response.access_token;
          this.refreshtoken = response.refresh_token;
          console.log("accessToken:", this.accesstoken);
          console.log("refreshToken:", this.refreshtoken);
          this.tokenService.setAccessToken(this.accesstoken);
          this.tokenService.setRefreshToken(this.refreshtoken);
      
          //this.testUser(this.email,this.phone);
          this._snackBar.open('Registration successful! Welcome to our platform.', '', {
            duration: 3000,
            panelClass: 'custom-snackbar',
          });    
          this.router.navigate(['/home']);
        }

      },
      (error) => {
      console.error('Registration failed:', error);
      this.fail=true;
      }
    );

    }


}
}
