import { Component, inject, Input, signal, WritableSignal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {AdminService} from '../../services/admin.service'
import {
  CardComponent,
  CardHeaderComponent,
  CardBodyComponent,
  FormDirective,
  FormControlDirective,
  RowComponent,
  ColComponent,
  ButtonDirective,
  TextColorDirective,
  GutterDirective,
  FormLabelDirective,
 
} from '@coreui/angular';
import { IconDirective, IconSetService } from '@coreui/icons-angular';
import { cilTask, cilTrash, cilPlus, cilCloudUpload, cilLoopCircular } from '@coreui/icons';
import { NotificationsComponent } from './notifications.component';
import { HttpResponse, HttpStatusCode } from '@angular/common/http';


@Component({
  selector: 'app-instructions',
  imports: [

   
    ReactiveFormsModule, 
    CommonModule,
   
     CardComponent,
     CardHeaderComponent,
     CardBodyComponent,
     FormDirective,
     FormControlDirective,
     RowComponent,
     ColComponent,
     ButtonDirective,
     TextColorDirective,
     GutterDirective,
   FormLabelDirective,
     IconDirective,
     NotificationsComponent
   
  ],
  templateUrl: './instructions.component.html',
  styleUrl: './instructions.component.scss'
})
export class InstructionsComponent {


  private fb = inject(FormBuilder)
  // declare the instruction form
  instructionForm?:FormGroup;

  iconSet = inject(IconSetService);

  busyState:WritableSignal<'nil'|'busy'> = signal('nil');

  // signals form error
  hasError = true;

  // The id of the assessment (just uploaded) whose instructional guide is to be set and uploaded
  @Input()
   uploadedAssessmentId?:number;
  
  //  The 'type' field represents the type of task currently on process
  // Since the InstructionsComponent is the last stage of the test upload task,
  // The 'taskType' is set to 'assessment upload' which is forwarded to the server via notification endpoint
    taskType = 'upload';

  //  Determines if instructional guides for the assessment has successfully been uploaded
  // When set to true, then the admin can proceed with sending notifications
   hasUploadedInstructions = signal(false);

   private adminService = inject(AdminService);

   cilTask = cilTask;
  cilTrash = cilTrash;
  cilPlus = cilPlus;
  cilCloudUpload = cilCloudUpload;
  cilLoop = cilLoopCircular

  constructor() {

    this.iconSet.icons = { cilTask, cilTrash, cilPlus, cilCloudUpload, cilLoopCircular };
  }


  ngOnInit(): void {

    this.instructionForm = this.fb.group({

      instructions:this.fb.array([this.formControl()]),
    })

    this.formArray.valueChanges.subscribe(() => this.processFormForErrors());
    
    
   
  }


  // Always return a new form control
  private formControl():FormControl{

    return new FormControl('',[Validators.required]);

    
  }

  // returns the form array
  get formArray():FormArray{


    return this.instructionForm?.get('instructions') as FormArray;
  }
  
  // Dynamically adds new form to the form array
  addInstruction(){

    this.formArray.push(this.formControl());

  }

  // Always deletes a form group at a the index of the form array
  deletInstruction(index:number){

    this.formArray.removeAt(index);
  }

  // checks if the form has errors
  private processFormForErrors(){

    const formSize = this.formArray.length;
    // if form array is empty, return true so upload button can be disabled
    if(!formSize) this.hasError = true;
    
   else{
    for (let index = 0; index < formSize; index++) {
      
      const formControl = this.formArray.at(index) as FormControl;
     
      if(!formControl.hasError('required')) this.hasError = false;

      else this.hasError = true
     
    } 
   }

    
  }

  // Uploads instructions for the test
  upload() {

    if((this.instructionForm && this.uploadedAssessmentId)){

      this.busyState.set('busy')


      

      this.adminService.uploadInstructions(this.instructionForm.value, this.uploadedAssessmentId)
      .subscribe({

        next:(response:HttpResponse<number>) =>{
       if(response.status === HttpStatusCode.Ok){

       
        
        this.adminService.setTaskMilestone(2);

        // sets the boolean flag to true so admin can proceed with sending notification
        this.hasUploadedInstructions.set(true);
       }
        },
        error:(err) => {

          this.busyState.set('nil')
        },
        complete:() => {
          this.busyState.set('nil')
        }
      })

    }
   
   
    }


}


   
  