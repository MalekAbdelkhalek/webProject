import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { HomeComponent } from './home/home.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import {MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { ContactComponent } from './contact/contact.component';
import { VisualisationComponent } from './visualisation/visualisation.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';









@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    HomeComponent, 
    ContactComponent,
    VisualisationComponent


  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule ,
    MatSnackBarModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatProgressSpinnerModule,
    CanvasJSAngularChartsModule,
    MatTableModule,
    MatSortModule,MatSelectModule,
    MatPaginatorModule,MatNativeDateModule,
    MatToolbarModule,MatIconModule,MatDatepickerModule,
    MatButtonToggleModule,MatFormFieldModule,MatInputModule

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }