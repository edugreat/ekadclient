import { AfterViewInit, Component, ElementRef, inject, Input, OnDestroy, OnInit, signal, ViewChild, WritableSignal } from '@angular/core';

import {
  CardComponent,
  CardHeaderComponent,
  CardBodyComponent,
  FormDirective,
  FormControlDirective,
  FormCheckComponent,
  FormCheckInputDirective,
  FormCheckLabelDirective,
  ButtonDirective,
  FormLabelDirective
} from '@coreui/angular';
import { IconDirective, IconSetService } from '@coreui/icons-angular';
import { cilBell, cilEnvelopeOpen, cilPeople, cilSend, cilLoopCircular } from '@coreui/icons';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NumericDirective } from '../../directives/numeric.directive';
import { CommonModule } from '@angular/common';
import { Institution, InstitutionService } from '../../services/institution.service';
import { AuthService, User } from '../auth.service';
import { Subscription, take } from 'rxjs';
import { AdminService} from '../../services/admin.service';
import { HttpResponse, HttpStatusCode } from '@angular/common/http';

@Component({
  selector: 'app-notifications',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NumericDirective,
    
    // CoreUI Components
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    FormDirective,
    FormControlDirective,
   
    FormCheckComponent,
    FormCheckInputDirective,
    FormCheckLabelDirective,
    ButtonDirective,
    FormLabelDirective, 
    IconDirective
  ],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss'
})
export class NotificationsComponent implements OnDestroy, AfterViewInit, OnInit {
  
  private fb = inject(FormBuilder);
  private institutionService = inject(InstitutionService);
  private authService = inject(AuthService);
  private adminService = inject(AdminService)
  iconSet = inject(IconSetService);
  busyState:WritableSignal<'nil'|'busy'> = signal('nil')

  disableFields = false;

  cilBell = cilBell;
  cilEnvelopeOpen = cilEnvelopeOpen;
  cilPeople = cilPeople;
  cilSend = cilSend;
  cilLoop = cilLoopCircular

  
  // Id for the event that is being notified about.
  // The event can be assessment upload, result releases etc
  @Input()
  eventId?:number;

  // The type of notification (e.g assessment upload, result releases etc)
  @Input()
  typeOfTask?:string;

  myInstitutions:Institution[] = [];

  // Object representing new notification we intend to forward to the server alerting student of important information
  newNotification:NotificationDTO | undefined;

  notificationForm?:FormGroup;

  // If the audience checkbox was checked
  private isChecked = false;

  // sets true when the check box is being clicked check. This is used to stop unckeck action by the processInstitutionChangeEvent() method
  // which is also called once the check box is checked.
   isCheckBoxJustClicked = false;

  
   @ViewChild('audienceCheck') audienceCheck?: ElementRef<HTMLInputElement>;

  @ViewChild('institutionSelect') institutionSelect?:ElementRef<HTMLInputElement>;



  // instance of currently logged in user

  private currentUser?:User;

  private currentUserSub?:Subscription;


  

// Used to disable the input fields during form submission to avoid re-submission 

selectedInstitution?: number;


  constructor(){

    this.iconSet.icons = { cilBell, cilEnvelopeOpen, cilPeople, cilSend, cilLoopCircular };
  }

  ngOnInit(): void {
   
    this._currentUser();

   this.getDetailsAboutNotification();

  }

ngAfterViewInit(): void {
  
  
this.audienceInputChange();
 
}

ngOnDestroy(): void {
  
  this.currentUserSub?.unsubscribe();
}
  // Method that processes the activated route to get information that would help draft the notification
  private getDetailsAboutNotification(){

    
// If these variables are availabele, then initiliaze new notification
      if(this.eventId && this.typeOfTask){

       
        this.newNotification = {

          metadata:this.eventId,
          type:this.typeOfTask,
          audience:[]
        }

        // Initialize the notification form group
        this.notificationForm = this.fb.group({
          message: new FormControl<string>('', Validators.required),
          audience: new FormControl<string|undefined>(''),
        })
       
      }
  
  }

 // get the object of logged in user
 private _currentUser(){

  this.currentUserSub = this.authService.loggedInUserObs$.subscribe(user => {

    if(user){
      this.currentUser = user;
      this.getInstitutions(this.currentUser.id)
    }
  })

}


    
    processCheckedBtn($event: Event) {

      const isCheck = ($event.target as HTMLInputElement).checked;
     
      this.isChecked = isCheck;
   
      
      if(this.isChecked){

       if(this.institutionSelect?.nativeElement.value){
        this.institutionSelect.nativeElement.value = '';
       }

      
      }

      if(this.audienceTextArea.value){

        this.audienceTextArea.setValue('');
      }

    }

    get isSuperAdmin(){
     
     
     return  this.authService.isSuperAdmin;

    
      
      }

      get isAdmin(){

        return this.authService.isAdmin
      }

    
// Immediately send notification
  notify() {
    
      this.processInput();

      this.busyState.set('busy');

      
      const institutionId = this.selectedInstitution ? this.selectedInstitution : 0;
      this.adminService.sendNotifications(this.newNotification!,  institutionId).pipe(take(1)).subscribe({

        // Set milestone to 3 once we are sure notification was sent successfully
        next:(response:HttpResponse<void>) => {
       
          if(response.status  === HttpStatusCode.Ok) {
           
            this.adminService.setTaskMilestone(3)


          }
          
          },

        // incase of erro, log it for the time being
        error:(err) => {

          this.message.enable();
          this.audience.enable();
          this.disableFields = false;
          this.busyState.set('nil');
          console.log(err);
        }
      })

    }

    // change event fired when select change is on the selection input
    processInstitutionChangeEvent() {
      
     
    

      if(this.audienceTextArea.value) this.audienceTextArea.setValue('');
      if(this.audienceCheck?.nativeElement.checked && !this.isCheckBoxJustClicked) this.audienceCheck.nativeElement.click()


     

      }

      private get message(){

        return this.notificationForm?.get('message') as AbstractControl<string>
      }

      private get audience(){

        return  this.notificationForm?.get('audience') as AbstractControl<string>;


      }

    // Processes the notification form and determines if the inputs align with the requirements
     canSubmit():boolean{

      const anyMessage = this.message.value;

      const institutionSelected = this.institutionSelect?.nativeElement?.value;

      const audienceTyped =this.audience.value;
      
      if(!anyMessage) return false;
      
      if(anyMessage &&  (this.isChecked || institutionSelected || audienceTyped)) return true;

     
        return false;
    }

    private get audienceTextArea():FormControl{

      return this.notificationForm?.get('audience') as FormControl;
    }

    // Process the audience input as the user types, just to ensure non-zero leading input
    private audienceInputChange(){

     
      
      let arr:string[];
      this.notificationForm?.get('audience')?.valueChanges.subscribe(() =>{

        // it temporarily stores the user input after leading zeros are removed if any
        arr = [];
        
        const input:string = this.notificationForm?.get('audience')?.value;
        // calls split method on the input string returning all values delimited by one or more white spaces
        input.split(/\s+/).forEach(x =>{

          // checks if the input is zero-leading, then removes the zero prefix
          if(x.charAt(0) === '0'){
           arr.push(x.substring(1));

          
          }
          else{
            arr.push(x);
           
          }
        })

        // if there is anything in the array, reset the value of the form control with each of the array elements, separating them by white
        // spaces, then stopping further event emission to avoid call stack issue.
      if(arr.length){
        
        this.notificationForm?.get('audience')?.setValue(arr.join(' '),{emitEvent:false});
      }


      if(this.audienceCheck?.nativeElement?.checked && !this.isCheckBoxJustClicked){

        this.audienceCheck.nativeElement.checked = !this.audienceCheck.nativeElement.checked;
        
      }

      if( this.institutionSelect?.nativeElement.value)  this.institutionSelect.nativeElement.value = '';
      })
    }
    // processess the inputs received
    private processInput(){

      // sets disableFields to true just to disable the input fields to avoid form re-submission
     this.message.disable();
     this.audience.disable();
     this.disableFields = true;

      // get the notification message
      this.newNotification!.message = this.notificationForm?.get('message')!.value;
      
      // If audience was provided
      if(this.notificationForm?.get('audience')?.value){

        // Non zero leading numerical values regex
      const regexp = /([1-9]\d*)/g;

      // return an array containing just the numerical value without the white spaces
      const audience:string[] | null = (this.notificationForm!.get('audience')!.value as string).match(regexp);

      // if audience was actually provided, fill the 'newNotification' audience property with it.
      if(audience){
       
        this.newNotification?.audience?.push(...audience);
      }
      

      }

     


    }


    // get a list of institutions registered by this admin
    private getInstitutions(adminId:number){

     
      this.institutionService.getRegisteredInstitutions(adminId).pipe(take(1)).subscribe({
        next:(data:Institution[]) => {

          this.myInstitutions = data;
        }
      })

    }

    
}

// DTO of notification forwarded to the server for data persistence of the just created notification
export type NotificationDTO = {
metadata:number, // describes id of what we are notifying about
type:string, // describes type of notification(e.g assessment upload etc)
message?:string, // overview description about the notification
audience:string[]  // who the notification is target to
}