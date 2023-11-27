import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TokensService } from '../tokens.service';
import { UserService } from '../user.service';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserInfoService } from '../user-info.service';
import { userInfo } from '../userInfo';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  showPassword = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  email: string = '';
	password: string = '';
	constructor(private userService:UserService, private http: HttpClient,private userinfoService:UserInfoService,
		private tokenSerivce: TokensService,private route: ActivatedRoute,private router: Router,private _snackBar: MatSnackBar){}

    accesstoken!:string;
    refreshtoken!:string;
  
    fail=false;
    /*public user!:userInfo;
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
        }*/
    submitForm() {
  
      console.log('Email:', this.email);
      console.log('Password:', this.password);
      this.userService.login(this.email, this.password).subscribe(
        (response) => {
        if (response.msg==='well logged in'){
          this._snackBar.open('Connexion réussie ! Bienvenue sur notre plateforme.', '', {
            duration: 3000,
            panelClass: 'custom-snackbar',
            });
        console.log('Authentication successful:', response);
        this.accesstoken = response.accessToken;
        this.refreshtoken = response.refreshToken;
        console.log("accessToken:", this.accesstoken);
        console.log("refreshToken:", this.refreshtoken);
        this.tokenSerivce.setAccessToken(this.accesstoken);
        this.tokenSerivce.setRefreshToken(this.refreshtoken);
  
        this.router.navigate(['home'])
        }else{
          this._snackBar.open("Échec de connexion. Veuillez vérifier les informations fournies et réessayer", '', {
            duration: 3000,
            });
            this.fail=true;
            console.log('Authentication failed:', response);
        }
        
        },
        (error) => {
        // Authentication failed
        console.error('Authentication failed:', error);
        }
      );
      }

  goToSignUp(){
		this.router.navigate(['/signup'])
    
	}
}