import { Component, effect, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { Subject, SubjectService } from '../../services/subject.service';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IconDirective } from '@coreui/icons-angular';
import { cilBook, cilPlus, cilTrash, cilCloudUpload, cilLoopCircular, cilWarning } from '@coreui/icons';

import {
  CardComponent,
  CardHeaderComponent,
  CardBodyComponent,
  FormDirective,
  FormControlDirective,
  ButtonDirective,
  RowComponent,
  ColComponent,
  FormLabelDirective,
  AlertModule
} from '@coreui/angular';
import { CommonModule } from '@angular/common';
import { DashboardStateService } from '../../services/dashboard-state.service';
import { AdminService, CategoryObject, SubjectObject } from '../../services/admin.service';
import { take } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';



@Component({
  selector: 'app-subject-upload',
  imports: [
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    FormDirective,
    FormControlDirective,
   CommonModule,
    ButtonDirective,
    RowComponent,
    ColComponent,
    FormLabelDirective,
    IconDirective,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AlertModule
  ],
  templateUrl: './subject-upload.component.html',
  styleUrl: './subject-upload.component.scss'
})
export class SubjectUploadComponent implements OnInit {

  private subjectService = inject(SubjectService);
  private fb = inject(FormBuilder);

  private dashboardStateService = inject(DashboardStateService);
  private adminService = inject(AdminService);
  private authService = inject(AuthService);
  private subjectsPerCategoryMap:Map<string, string[]> = new Map([]);
  uploadingState:WritableSignal<'nil'|'success'> = signal('nil');
 
 
  subjectForm:FormGroup;
   subjects:Subject[] = [];


   existingCategories:string[] = [];

   errorMessage = '';

   disableOnDuplicateEntries = false;

  submissionStatus:WritableSignal<'nil'|'busy'> = signal('nil');

  categories = ['Science', 'Arts', 'Commerce', 'Technology', 'Languages'];

  cilBook = cilBook;
  cilPlus = cilPlus;
  cilTrash = cilTrash;
  cilCloudUpload = cilCloudUpload;
  cilLoopCircular = cilLoopCircular;
  cilWarning = cilWarning

  private idPlaceHolder = 0;

  constructor(){

    this.dashboardStateService.hideStepper = true;

    this.subjectForm = this.fb.group({
      id: [{ value: this.idPlaceHolder++, disabled: true }],
      subjectName: ['', Validators.required],
      category: ['', Validators.required]
    });

    this.onSubjectNameChange();

         
  effect(() => {

    if(this.authService.loadResources()&& this.authService.isAdmin){

        this.fetchExistingCategories()
      
    }
  })
   
  }

  ngOnInit(): void {

   
 

  
    this.onSubjectNameChange();
   
  }

  

  private onSubjectNameChange() {
    this.subjectName.valueChanges.subscribe(val => {

      const subj = this.subjects.map(subject => subject.subjectName.toLowerCase())
        .filter(name =>{

          return this.subjectName.value ? this.subjectName.value.toLowerCase() === name : false;
        } );

      


      if (subj.length) {

     

        this.disableOnDuplicateEntries = true;
        this.errorMessage = `duplicate entry ${this.subjectName.value}`;
      } else  {
        const alreadyExists = this.existsInBackend(this.subjectName.value);

        this.errorMessage = '';
        this.disableOnDuplicateEntries = false;

      if(alreadyExists){

        this.disableOnDuplicateEntries = true;
        this.errorMessage = `${this.subjectName.value}, exists in the database.`
        this.disableOnDuplicateEntries = true;
      }
      }


    });
  }

  existsInBackend(subjectName:string){
  
 if(this.subjectName.value){

  for (let index = 0; index < this.existingCategories.length; index++) {
    const name = this.existingCategories[index];

    if(this.subjectsPerCategoryMap.get(name)
      ?.map(n => n.toLowerCase()).includes(subjectName.toLowerCase())){
    
    return true
    }
    

   
   }
 }

   return false;

  }

  addSubject(): void {

    const previousLength = this.subjects.length;

    let currentLength = 0;
    if (this.subjectForm.get('subjectName')?.valid) {
    currentLength =  this.subjects.push({
        id: this.subjectForm.get('id')?.value,
        subjectName: this.subjectForm.get('subjectName')?.value,
        category: this.subjectForm.get('category')?.value
      });
      this.subjectForm.get('subjectName')?.reset();
      this.subjectForm.get('id')?.setValue(this.idPlaceHolder++);
    }

    if(currentLength > previousLength){

      this.sortSubjectList();
    }
    
   
  }

  private sortSubjectList() {
    this.subjects.sort((a, b) => {
      if (a.subjectName > b.subjectName) return 1;
      if (a.subjectName < b.subjectName) return -1;

      return 0;
    });
  }

  removeSubject(index: number): void {
   const removedItem =  this.subjects.splice(index, 1);

   const currentSubjectName = this.subjectName.value;

   if(this.errorMessage && removedItem[0].subjectName.toLowerCase() === currentSubjectName.toLowerCase()){

    this.errorMessage = '';
    this.disableOnDuplicateEntries = false;
   }
  
  }

  onCategoryChange(): void {
    if (this.subjectForm.get('category')?.dirty) {
      this.subjects = [];
      this.subjectForm.get('subjectName')?.reset();
      this.subjectForm.get('id')?.setValue(0);
    }
  }

  get subjectName(){

    return this.subjectForm.get('subjectName') as AbstractControl<string>;
  }

  get category(){

    return this.subjectForm.get('category') as AbstractControl<string>;
  }

  get disableAdd(){

    if(this.disableOnDuplicateEntries) return true;

    if(!this.subjectName.valid || !this.subjectName.value.trim().length ||
     !this.category.valid || !this.category.value.trim().length)  return true;

     return false;

  }

  get disableSubmission(){

    return (!this.subjects.length)
  }

  private fetchExistingCategories(){



    return this.adminService.fetchCategories().pipe(take(1)).subscribe({

      next:(categories:CategoryObject) =>{
      categories._embedded.levels.forEach(l => {
        this.existingCategories.push(l.category);

        this.fetchSubjects(l._links.subjects.href, l.category);
      });

      }
    })
  }

  private fetchSubjects(url:string, category:string){

    return this.adminService.fetchSubjects(url).pipe(take(1)).subscribe({

      next:(subjects:SubjectObject) => {
        subjects._embedded.subjects.forEach(subject => 
         
          {
           
            const subjectArr = this.subjectsPerCategoryMap.get(category);

           if(subjectArr){
            subjectArr.push(subject.subjectName);
           }else{
           this.subjectsPerCategoryMap.set(category, [subject.subjectName]);

           }
          }
         
         );
      }
    })
  }

  onSubmit(): void {
    if (this.subjects.length > 0) {

      this.submissionStatus.set('busy');
      this.uploadingState.set('nil');

      this.subjectService.uploadSubjects(this.subjects).subscribe({
        next: (response) => {
         
          this.submissionStatus.set('nil')
          this.uploadingState.set('success');
          this.subjects = [];
          this.subjectForm.reset({
            id: this.idPlaceHolder++,
            subjectName: '',
            category: this.subjectForm.get('category')?.value
          });
        },
        error: (err:HttpErrorResponse) => {

          this.errorMessage = err.error.message;
          console.error('Upload failed', err);

          this.submissionStatus.set('nil')
        },

        complete:() => setTimeout(() => {
          this.uploadingState.set('nil');
          this.subjectsPerCategoryMap.clear();
          this.subjects = [];
          this.existingCategories = [];

          this.fetchExistingCategories();
        }, 1000)
      });

    }

   


  }

 
}
