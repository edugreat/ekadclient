import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { Subject, SubjectService } from '../../services/subject.service';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IconDirective } from '@coreui/icons-angular';
import { cilBook, cilPlus, cilTrash, cilCloudUpload, cilLoopCircular } from '@coreui/icons';

import {
  CardComponent,
  CardHeaderComponent,
  CardBodyComponent,
  FormDirective,
  FormControlDirective,
  ButtonDirective,
  RowComponent,
  ColComponent,
  FormLabelDirective
} from '@coreui/angular';
import { CommonModule } from '@angular/common';
import { DashboardStateService } from '../../services/dashboard-state.service';



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
    ReactiveFormsModule
  ],
  templateUrl: './subject-upload.component.html',
  styleUrl: './subject-upload.component.scss'
})
export class SubjectUploadComponent implements OnInit {

  private subjectService = inject(SubjectService);
  private fb = inject(FormBuilder);

  private dashboardStateService = inject(DashboardStateService);
 
  subjectForm:FormGroup;
   subjects:Subject[] = [];

  submissionStatus:WritableSignal<'nil'|'busy'> = signal('nil');

  categories = ['Science', 'Arts', 'Commerce', 'Technology', 'Languages'];

  cilBook = cilBook;
  cilPlus = cilPlus;
  cilTrash = cilTrash;
  cilCloudUpload = cilCloudUpload;
  cilLoopCircular = cilLoopCircular;

  private idPlaceHolder = 0;

  constructor(){

    this.subjectForm = this.fb.group({
      id: [{ value: this.idPlaceHolder++, disabled: true }],
      subjectName: ['', Validators.required],
      category: ['', Validators.required]
    });
   
  }

  ngOnInit(): void {


    this.dashboardStateService.hideStepper = true;
  }

  

  addSubject(): void {
    if (this.subjectForm.get('subjectName')?.valid) {
      this.subjects.push({
        id: this.subjectForm.get('id')?.value,
        subjectName: this.subjectForm.get('subjectName')?.value,
        category: this.subjectForm.get('category')?.value
      });
      this.subjectForm.get('subjectName')?.reset();
      this.subjectForm.get('id')?.setValue(this.idPlaceHolder++);
    }
  }

  removeSubject(index: number): void {
    this.subjects.splice(index, 1);
  }

  onCategoryChange(): void {
    if (this.subjectForm.get('category')?.dirty) {
      this.subjects = [];
      this.subjectForm.get('subjectName')?.reset();
      this.subjectForm.get('id')?.setValue(0);
    }
  }

  get subjectName(){

    return this.subjectForm.get('category') as AbstractControl<string>;
  }

  get category(){

    return this.subjectForm.get('category') as AbstractControl<string>;
  }

  get disableAdd(){

    if(!(this.subjectName.valid && this.subjectName.value.trim().length) &&
     !(this.category.valid && this.category.value.trim().length) ) return true;

     return false;

  }

  onSubmit(): void {
    if (this.subjects.length > 0) {

      this.submissionStatus.set('busy');

      // this.subjectService.uploadSubjects(this.subjects).subscribe({
      //   next: (response) => {
      //     console.log('Upload successful', response);
      //     this.submissionStatus.set('nil')
      //     this.subjects = [];
      //     this.subjectForm.reset({
      //       id: this.idPlaceHolder++,
      //       subjectName: '',
      //       category: this.subjectForm.get('category')?.value
      //     });
      //   },
      //   error: (err) => {
      //     console.error('Upload failed', err);

      //     this.submissionStatus.set('nil')
      //   }
      // });
    }


  }
}
