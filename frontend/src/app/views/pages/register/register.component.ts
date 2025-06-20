import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { IconDirective } from '@coreui/icons-angular';
import { cilLockLocked, cilPhone, cilUser } from '@coreui/icons';
import { IconSetService } from '@coreui/icons-angular';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { 
  ContainerComponent, 
  RowComponent, 
  ColComponent, 
  TextColorDirective, 
  CardComponent, 
  CardBodyComponent, 
  FormDirective, 
  InputGroupComponent, 
  InputGroupTextDirective, 
  FormControlDirective, 
  ButtonDirective
} from '@coreui/angular';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, FormControl } from '@angular/forms';
import { emailValidator, nameValidator, passwordValidator, phoneNumberValidator, } from '../../valid.credential';
import { StudentRegisterationData, RegisterationService } from './registeration.service';
import { take } from 'rxjs';

import { Router } from '@angular/router';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
    imports: [
      CommonModule,
      ContainerComponent, 
      RowComponent, 
      ColComponent, 
      TextColorDirective, 
      CardComponent, 
      CardBodyComponent, 
      FormDirective, 
      InputGroupComponent, 
      InputGroupTextDirective, 
      IconDirective, 
      FormControlDirective, 
      ButtonDirective,
      MatIconModule,
      ReactiveFormsModule,
     
      
    ],
    standalone: true,
    providers: [IconSetService,
     
    ]
})
export class RegisterComponent implements OnInit {

  private fb = inject(FormBuilder);
  private iconSet = inject(IconSetService);
  private router = inject(Router);
  private registrationService = inject(RegisterationService);
  private successfullRegiSnackbar = inject(MatSnackBar);
  registerForm: FormGroup;
  showPassword: boolean = false;
  showRepeatPassword: boolean = false;
  showInstructorOption: boolean = false;
  errorMessage = '';
   passwordsMatch = true;
   mobileNumberValid = true;

   @ViewChild('repeatPasswordInput')repeatPasswordInput!:ElementRef<HTMLInputElement>;

   @ViewChild('passwordInput')passwordInput!:ElementRef<HTMLInputElement>;


  constructor(
   
  ) {
    this.iconSet.icons = { cilLockLocked, cilPhone, cilUser };
    this.registerForm = this.fb.nonNullable.group({
      firstName: ['', [Validators.required,nameValidator()]],
      lastName: ['', [Validators.required, nameValidator()]],
      email: ['', [Validators.required,emailValidator()]],
      mobileNumber: ['', ],
      status: ['junior', Validators.required],
      password: ['', [Validators.required,passwordValidator()]],
      repeatPassword: ['',[Validators.required, passwordValidator()]],
     
    });
  }

  

  ngOnInit() {
    this.repeatPassword.valueChanges.subscribe(() => {
      this.passwordsMatch = this.validatePasswordMatch();
    });

    this.password.valueChanges.subscribe(() => {
      this.passwordsMatch = this.validatePasswordMatch();
    });


   this.mobileNumber.valueChanges.subscribe(() => {
    const mobileNumberNumber = this.mobileNumber.value;

    if(mobileNumberNumber && mobileNumberNumber.trim().length > 0) {
      this.mobileNumberValid = this.validatemobileNumberNumber(mobileNumberNumber);
    }
    else {
      this.mobileNumberValid = true; // If mobileNumber number is empty, consider it valid
    }
  });   

   
  }

 

  togglePasswordVisibility(input: HTMLInputElement) {
   

    if(input === this.repeatPasswordInput.nativeElement){

    
      this.showRepeatPassword = !this.showRepeatPassword;
      this.repeatPasswordInput.nativeElement.type = this.showRepeatPassword ? 'text' : 'password';
      return;
    } 
    if(input === this.passwordInput.nativeElement){
     
      this.showPassword = !this.showPassword;
      this.passwordInput.nativeElement.type = this.showPassword ? 'text' : 'password';
      return;
    }

  
  }

  toggleInstructorOption() {
    this.showInstructorOption = !this.showInstructorOption;
    this.registerForm.get('isInstructor')?.setValue(this.showInstructorOption);
  }



  get firstName() {
    return this.registerForm.get('firstName') as AbstractControl<string>;
  }
  get lastName() {
    return this.registerForm.get('lastName')as AbstractControl<string>;
  }
  get email() {
    return this.registerForm.get('email')as AbstractControl<string>;
  }
  get mobileNumber() {
    return this.registerForm.get('mobileNumber')as AbstractControl<string>;
  }
  get status() {
    return this.registerForm.get('studentLevel')as AbstractControl<string>;
  }

 

  

  disableSubmission(){
  
   
    return (!(this.password.value && this.password.value.trim().length > 0 
  && this.repeatPassword.value && this.repeatPassword.value.trim().length> 0
  && this.firstName.valid && this.lastName.valid && this.mobileNumberValid ))
  
  }

  private validatemobileNumberNumber(mobileNumberNumber:string){

    const validationFn = phoneNumberValidator();

    const validationResult = validationFn(new FormControl(mobileNumberNumber));

    return validationResult === null; // If null, the mobileNumber number is valid
  }



  onSubmit() {

    console.log('submitting')

    
    let user: StudentRegisterationData = this.registerForm.value;
    

  
    this.registrationService.registerUser(user).pipe(take(1)).subscribe({

     

      error:(err:HttpErrorResponse) =>{
      this.errorMessage = err.error;
      
      setTimeout(() => {
        this.errorMessage = '';
      }, 10000);

      },

      complete:() => {

        this.registerForm.reset();
         
        this.openSnackBar();

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 5000);

      }
    })
    
  }

   get password(): AbstractControl<string> {
    return this.registerForm.get('password') as AbstractControl<string>;
  }
  
   get repeatPassword(): AbstractControl<string> {
    return this.registerForm.get('repeatPassword') as AbstractControl<string>;
  }

  private validatePasswordMatch(){

    return this.password.value === this.repeatPassword.value ;

  }

  private openSnackBar(){
    this.successfullRegiSnackbar.open(
     'Account Created!', '', {
       duration: 5000, // 5 seconds
       verticalPosition: 'top', 
       horizontalPosition: 'center', 
       panelClass: ['success-snackbar']
     }
    )
 
   }

}
