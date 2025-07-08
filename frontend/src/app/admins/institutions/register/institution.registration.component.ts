import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Region } from '../../../util/regions';
import { AuthService, User } from '../../../services/auth.service';
import { InstitutionService, Institution} from '../../../services/institution.service';
import { Subscription, take } from 'rxjs';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { 
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardFooterComponent,
  CardHeaderComponent,
  ColComponent,
  FormControlDirective,
  FormDirective,
  FormFeedbackComponent,
  FormLabelDirective,
  FormSelectDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  RowComponent,
  SpinnerComponent,
  ToasterComponent,
  ToastBodyComponent,
  ToastComponent,
  ToastHeaderComponent
} from '@coreui/angular';
import { CommonModule } from '@angular/common';
import { IconComponent, IconDirective } from '@coreui/icons-angular';
import { cilCheckCircle, cilWarning } from '@coreui/icons';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-institution-registration',
  templateUrl: './institution.registration.component.html',
  styleUrls: ['./institution.registration.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardFooterComponent,
  CardHeaderComponent,
  ColComponent,
  FormControlDirective,
  FormDirective,
  FormFeedbackComponent,
  FormLabelDirective,
  
 
  
  RowComponent,
  SpinnerComponent,
  ToasterComponent,
  ToastBodyComponent,
  ToastComponent,
  ToastHeaderComponent,
   IconComponent
  ]
})
export class InstitutionRegistrationComponent implements OnInit, OnDestroy {
  registrationForm: FormGroup;
  regions: Region[] = [];
  localGovts: string[] = [];
  
  isLoading = false;
  showSuccessToast = false;
  showErrorToast = false;
  errorMessage = '';

   private fb = inject(FormBuilder);
    private institutionService = inject(InstitutionService);
    private router = inject(Router);
    private authService = inject(AuthService);
    private activatedRout = inject(ActivatedRoute)

    private currentUser = toSignal(this.authService.currentUserOb$);
  
  

  private currentUserSub?: Subscription;
  private toastTimeout?: any;

  constructor(
   
  ) {
    this.registrationForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9].*/)]],
      state: ['', Validators.required],
      localGovt: ['', Validators.required],
      createdBy: [null]
    });
  }

  ngOnInit(): void {
    this.setCreatedBy();
   
    this.setupFormListeners();
  }

  ngOnDestroy(): void {
    this.currentUserSub?.unsubscribe();
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
  }

  private setCreatedBy(): void {
  setTimeout(() => {
    
      if (this.currentUser()) {
     this.registrationForm.get('createdBy')?.setValue(this.currentUser()!.id);
    }

     this.loadRegions();
  }, 600);
  }

  private loadRegions(): void {
    this.isLoading = true;
   this.institutionService.getRegions().subscribe({

    next:(value:Region[]) => {
      this.regions = value;
      this.isLoading = false;
    },

    error:(err:HttpErrorResponse) => {

      this.errorMessage = err.message;
      this.isLoading = false;
    }

   });
  }

  private setupFormListeners(): void {
    this.stateControl.valueChanges.subscribe(state => {
      if(this.stateControl.invalid){

        this.localGovtControl.disable()
      }
      this.updateLocalGovts(state);
    });
  }

  private updateLocalGovts(stateName: string): void {
    this.localGovtControl.reset();
    this.localGovts = [];
    
    if (stateName) {
      const selectedState = this.regions.find(s => s.name === stateName);
      if (selectedState) {
        this.localGovts = selectedState.lgas;
      }
    }
  }

   isFieldInvalid(fieldName: string): boolean {
    const control = this.registrationForm.get(fieldName);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }
  onSubmit(): void {
    if (this.registrationForm.invalid) {
      this.showError('Please fill all required fields correctly');
      return;
    }

    this.isLoading = true;
    const institution: Institution = this.registrationForm.value;
    this.localGovtControl.disable()
    this.stateControl.disable()

    console.log(`${JSON.stringify(institution)}`)
    

    this.institutionService.registerInstitution(institution).pipe(take(1)).subscribe({
      next: (response) => {
        if (response.status === HttpStatusCode.Ok) {
          this.showSuccess();
          this.registrationForm.reset();
          this.localGovtControl.enable();
          this.stateControl.enable();
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        if (err.error === 'already exists') {
          this.showError('This institution is already registered');
        } else {
          this.showError('Registration failed. Please try again later');
        }

        this.stateControl.enable();
        this.localGovtControl.enable();
      }
    });
  }

  private showSuccess(): void {
    this.showSuccessToast = true;
    this.toastTimeout = setTimeout(() => {
      this.showSuccessToast = false;
    }, 5000);
  }

  private showError(message: string): void {
    this.errorMessage = message;
    this.showErrorToast = true;
    this.toastTimeout = setTimeout(() => {
      this.showErrorToast = false;
    }, 5000);
  }

  get stateControl(): FormControl {
    return this.registrationForm.get('state') as FormControl;
  }

  get nameControl(): FormControl {
    return this.registrationForm.get('name') as FormControl;
  }

  get localGovtControl(): FormControl {
    return this.registrationForm.get('localGovt') as FormControl;
  }

  addStudents(): void {
    if (this.currentUser()) {
      this.router.navigate(['/institution/add-students', this.currentUser()!.id]);
    }
  }
}