import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule, NgStyle } from '@angular/common';
import {  AbstractControl, FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'; // Add this import
import { IconDirective, IconSetService,  } from '@coreui/icons-angular';

import { 
  ContainerComponent, 
  RowComponent, 
  ColComponent, 
  CardGroupComponent, 
  TextColorDirective, 
  CardComponent, 
  CardBodyComponent, 
  FormDirective, 
  InputGroupComponent, 
  InputGroupTextDirective, 
  FormControlDirective, 
  ButtonDirective 
} from '@coreui/angular';
import { Router, RouterLink } from '@angular/router';
import { cibFacebook, cibGoogle, cibTwitter, cilLockLocked, cilLoopCircular, cilThumbUp, cilUser } from '@coreui/icons';
import { emailValidator, passwordValidator } from '../../valid.credential';
import { AuthService } from '../../../services/auth.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    imports: [

      CommonModule,
      ContainerComponent, 
      RowComponent, 
      ColComponent, 
      CardGroupComponent, 
      TextColorDirective, 
      CardComponent, 
      CardBodyComponent, 
      FormDirective, 
      InputGroupComponent, 
      InputGroupTextDirective, 
      IconDirective, 
      FormControlDirective, 
      ButtonDirective, 
      NgStyle,
      RouterLink,
      FormsModule,
      ReactiveFormsModule,
      MatIconModule
    ],
    standalone: true,
    providers: [IconSetService]
})
export class LoginComponent implements OnInit {
  
  loginStatus: WritableSignal<'idle' | 'loading' | 'success' | 'error'> = signal('idle');
  

  errorMessage: string = '';
  showPassword = false;
  // flag to disable logon button once login has been initiated to prevent repeated login
  disableOnLogin = signal(false);
  
  iconSet = inject(IconSetService);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = this.fb.nonNullable.group({
    email:['',[Validators.required, emailValidator()]],
    password:['', [Validators.required, passwordValidator()]],
    adminRole:['']
  })

  constructor() {

    this.iconSet.icons ={
      cilThumbUp,cilUser,cilLockLocked,cilLoopCircular,cibTwitter,
      cibFacebook, cibGoogle
    }

    
  }

  ngOnInit(){

   
  }

  togglePasswordVisibility(input: HTMLInputElement) {
    this.showPassword = !this.showPassword;
    input.type = this.showPassword ? 'text' : 'password';
  }
  
  login() {
    this.loginStatus.set('loading');
    this.disableOnLogin.set(true);


    return this.authService.login(this.email.value, this.password.value, this.isAdmin ? 'Admin' : 'Student').subscribe({
      next:(user) => {

        this.loginStatus.set('success');
        
      },

      error:(err) => {
        this.loginStatus.set('error');
        this.errorMessage = typeof err.error !== 'object' ? err.error : 'Server not responding!';
        this.disableOnLogin.set(false);
      },

      complete:() => setTimeout(() => {
       
        this.router.navigate(['/dashboard'])
      }, 1000)
    })


  }

    get  email(){

  return this.loginForm.get('email') as AbstractControl<string>;
  }

    get password(){

    return this.loginForm.get('password') as AbstractControl<string>;
  }

  get isEmailValid(): boolean {
   
    return this.loginForm.get('email')?.valid ?? false;
  }

  get isPasswordValid(): boolean {
    return this.loginForm.get('password')?.valid ?? false;
  }

  get isAdmin(){
    return this.loginForm.get('adminRole')?.value;
  }
}