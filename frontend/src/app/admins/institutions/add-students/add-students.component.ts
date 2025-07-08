import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormArray, FormGroup, Validators, FormsModule, FormControl } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RowComponent, ColComponent, TextColorDirective, CardComponent, CardHeaderComponent, CardBodyComponent, ButtonDirective, SpinnerComponent, AlertModule, ToastComponent, ToasterComponent, FormModule, ToastHeaderComponent, ToastBodyComponent } from '@coreui/angular';
import { InstitutionService } from '../../../services/institution.service';
import { HttpErrorResponse } from '@angular/common/http';
import { take, finalize } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { IconComponent } from '@coreui/icons-angular';
import { MatIconModule } from '@angular/material/icon';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule, MatSelect } from '@angular/material/select';
import {  MatOption} from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

type StudentRecord = {
  email: string,
  password: string
}

@Component({
  selector: 'app-button-groups',
  templateUrl: './add-students.component.html',
  styleUrls: ['./add-students.component.scss'],
  imports: [RowComponent, ColComponent, TextColorDirective,
    CardComponent, CardHeaderComponent,
    CardBodyComponent,
    ButtonDirective, RouterLink,
    FormModule,
    FormsModule,
   
    MatIconModule,


    CommonModule,
    SpinnerComponent,
    IconComponent,
    ToastHeaderComponent,
    ToastBodyComponent,
    ToastComponent,
    ToasterComponent,
    MatFormFieldModule,
    MatFormField,
    MatInputModule,
    MatButtonModule,
    
   
    MatSelect,
    MatOption,
    MatSelectModule,

    ReactiveFormsModule,
    AlertModule
  ]
})
export class AddStudentsComponent {

  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private institutionService = inject(InstitutionService);
  private authService = inject(AuthService);
  private router = inject(Router)



  institutions: any[] = [];
  
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  infoMessage = '';
  showSuccessToast = false;
  showErrorToast = false;
  addedStudents: StudentRecord[] = [];
  showClearAllBtn = signal(false);


  // Form controls
  addStudentForm = this.fb.group({
    institution: new FormControl<number|null>(null, [Validators.required]),
    records: this.fb.array([])
  });

  constructor(){

   
  }

  // Password visibility
  passwordVisible = false;
  passwordFieldType = 'password';

  // Property injection for form array
  get records(): FormArray {
    return this.addStudentForm.get('records') as FormArray;
  }

  ngOnInit(): void {
    const adminId = this.route.snapshot.paramMap.get('admin');


    setTimeout(() => {

     

    if (adminId) {
       this.loadInstitutions(Number(adminId));

      return;
    }else{

      this.authService.currentUserOb$.pipe(take(1))
      .subscribe(user => {
        if(user){
          this.loadInstitutions(user.id);

        }else{

          this.errorMessage = "Your identity could not be verified. Redirecting to login page...";
          setTimeout(() => {
          
            this.router.navigate(['/login'])
            
          }, 3000);
          return;
        }
      })
    }
     
    }, 600);
  }

  private loadInstitutions(adminId: number): void {
    this.isLoading = true;

    this.institutionService.getRegisteredInstitutions(adminId)
      .pipe(
        take(1),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (institutions) => {
          this.institutions = institutions;
          console.log(`institutions: ${JSON.stringify(institutions)}`)
          if (institutions.length === 0) {
            this.infoMessage = 'You have not registered any institutions yet.';
          }
        },
        error: (err: HttpErrorResponse) => {
          this.handleError(err, 'Failed to load institutions');
        }
      });
  }

  private createRecord(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  addRecord(): void {
    const newRecord = this.createRecord();
    this.records.push(newRecord);

    // Watch for changes to update the preview list
    newRecord.valueChanges.subscribe(() => {
      this.updateAddedStudents();
    });
  }

  deleteRecord(index: number): void {
    this.records.removeAt(index);
    this.updateAddedStudents();
  }

  private updateAddedStudents(): void {
    this.addedStudents = this.records.controls
      .filter(control => control.valid)
      .map(control => control.value);
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
    this.passwordFieldType = this.passwordVisible ? 'text' : 'password';
  }

  onSubmit(): void {
   if(this.addStudentForm.valid){

    this.errorMessage = '';

      this.isSubmitting = true;
      const institution = this.addStudentForm.value.institution;
    const records: StudentRecord[]  = [];
     this.showClearAllBtn.set(false);

    for (let index = 0; index < this.records.length; index++) {
     
      records.push(this.records.at(index).value)
      
    }
  
    this.addStudentForm.disable();

   

    this.institutionService.addStudentRecords(institution!, records)
      .pipe(
        take(1),
        finalize(() =>{
           this.isSubmitting = false;
           this.addStudentForm.reset();
        })
      )
      .subscribe({
        next: () => {
          this.showSuccessToast = true;
          this.records.clear();
          this.addedStudents = [];
          this.addStudentForm.enable();
         
          setTimeout(() => this.showSuccessToast = false, 5000);
        },
        error: (err: HttpErrorResponse) => {
          this.handleError(err, 'Failed to add students');
          this.addStudentForm.enable();
        }
      });
   }
  
  }

  toggleClear(){

   this.addedStudents.splice(0);
   this.showClearAllBtn.set(false);
  }

  private handleError(error: HttpErrorResponse, defaultMessage: string): void {
    this.showErrorToast = true;

    switch (error.error) {
      case 'Email and or password error':
        this.errorMessage = 'Invalid student record format';
        this.showClearAllBtn.set(false);
        break;
      case 'some records already exist':
      this.showClearAllBtn.set(true);
        this.errorMessage = 'Some students already exist in the system';
       break;
        case 'wrong email and or password':
          this.errorMessage = 'please check your email and password';
          this.showClearAllBtn.set(true);
        break;
      default:
        this.errorMessage = defaultMessage;
        this.showClearAllBtn.set(false);
        break;
    }

    setTimeout(() => this.showErrorToast = false, 8000);
  }
}
