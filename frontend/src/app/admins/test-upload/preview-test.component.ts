import { Component, effect, Input, OnDestroy, OnInit, signal, WritableSignal } from '@angular/core';

import { FormArray, FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription, take } from 'rxjs';

import { HttpResponse, HttpStatusCode } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminService, Question, TestDTO } from '../../services/admin.service';
// CoreUI imports
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
  PaginationComponent,
  PageItemComponent,
  PageLinkDirective,
  
  FormLabelDirective} from '@coreui/angular';
import { IconDirective, IconSetService } from '@coreui/icons-angular';
import { cilInfo, cilList, cilListRich, cilPencil, cilSave, cilCloudUpload, cilLoopCircular } from '@coreui/icons';
import { InstructionsComponent } from './instructions.component';


@Component({
    selector: 'app-preview-test',
    templateUrl: './preview-test.component.html',
    styleUrl: './preview-test.component.scss',
    standalone: true,
    imports: [
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      
      // CoreUI
      CardComponent,
      CardHeaderComponent,
      CardBodyComponent,
      FormDirective,
      FormControlDirective,
     // FormSelectDirective,
      RowComponent,
      ColComponent,
      ButtonDirective,
      TextColorDirective,
      GutterDirective,
      PaginationComponent,
      PageItemComponent,
      PageLinkDirective,
     
      FormLabelDirective,
     // InputGroupComponent,
     // InputGroupTextDirective,
      IconDirective,
      
      // Other components
      InstructionsComponent
    ]
})
export class PreviewTestComponent implements OnInit, OnDestroy {
  // Icons
  cilInfo = cilInfo;
  cilList = cilList;
  cilListRich = cilListRich;
  cilPencil = cilPencil;
  cilSave = cilSave;
  cilCloudUpload = cilCloudUpload;
  cilLoop = cilLoopCircular

  // Rest of the component code remains the same...
  @Input() preview: TestDTO | undefined;
  testForm: FormGroup | undefined;
  currentPageIndex = 0;
  totalPageIndex = 0;
  endOfPage = false;
  paginatedQuestion?: FormGroup;
  optionsContainer = new Array<string[]>();
  editMode = signal(false)
  optionsValueChangeSubscription: Subscription | undefined;
  answerValueChangeSubscription: Subscription | undefined;
  hasUploaded  = signal(false);
  uploadedAssessmentId?: number;

  uploadingStatus:WritableSignal<'nil'|'busy'> = signal('nil');

  constructor(
    private fb: FormBuilder, 
    private adminService: AdminService, 
    public iconSet: IconSetService
  ) {
    iconSet.icons = { cilInfo, cilList, cilListRich, cilPencil, cilSave, cilCloudUpload,cilLoopCircular };


    // disables or enables for inputs based on the state of edit mode
    effect(() => !this.editMode() ? this.disablePreviewInputs() : this.enablePreviewInputs());

  }
  ngOnInit(): void {
   
    this.initializeForm();
    this.initializePageInfo();

    this.handleOptionValueChanges();
    this.handleAnswerValueChanges();

  }
  ngOnDestroy(): void {
    this.optionsValueChangeSubscription?.unsubscribe();
  }

 
  // Initializes dynamic form build from existing data
  private initializeForm() {

    this.testForm = this.fb.group({
      id: new FormControl<number | null>({ value: this.preview!.id, disabled: true }),
      category: new FormControl<string | undefined>({ value: this.preview!.category, disabled: true }),
      subjectName: new FormControl<string | undefined>({ value: this.preview!.subjectName, disabled: true }),
      testName: new FormControl<string | undefined>({ value: this.preview!.testName, disabled: true }),
      duration: new FormControl<number | undefined>({ value: this.preview!.duration, disabled: true }),
      questions: this.fb.array([])
    });

    // Populate questions and their associated options here
    this.populateQuestions();


  }

  private populateQuestions() {


    //for each of the question, call createQuestion, passing in the 'question' argument
    this.preview!.questions.forEach(question => (this.testForm!.get('questions') as FormArray).push(this.createQuestion(question)));
  }

  // Create question form group
  private createQuestion(question: Question): FormGroup {

    const questionGroup: FormGroup = this.fb.group({

      questionNumber: new FormControl<number | undefined>({ value: question.questionNumber, disabled: true }, { nonNullable: true, validators: Validators.required }),
      question: new FormControl<string | undefined>({ value: question.question, disabled: true }, { nonNullable: true, validators: Validators.required }),
      answer: new FormControl<string | undefined>({ value: question.answer, disabled: true }, { nonNullable: true, validators: Validators.required }),

      options: this.fb.array([])
    });




    question.options.forEach(option => {
      if(option){
        (questionGroup.get('options') as FormArray).push(this.createOptions(option))
      }
    });

    return questionGroup;


  }

  // Create options form group
  private createOptions(option: Option): FormGroup {

    return this.fb.group({
      text: new FormControl<string | undefined>({ value: option?.text, disabled: true }, { nonNullable: true, validators: Validators.required }),
      letter: new FormControl<string | undefined>({ value: option?.letter, disabled: true }, { nonNullable: true, validators: Validators.required })
    })


  }


  // returns the question form array
  private get questionsArray(): FormArray {


    return this.testForm!.get('questions') as FormArray;
  }

  // returns the question array at the given index
  private getQuestionAt(index: number): FormGroup {
    return this.questionsArray.at(index) as FormGroup;


  }

  // Returns the category formcontrol for the purpose of editing
  private get category(): FormControl {


    return this.testForm?.get('category') as FormControl;
  }

  // Returns subjectName formcontrol for the purpose of editing
  private get subjectName(): FormControl {

    return this.testForm?.get('subjectName') as FormControl;
  }

  // Returns testName formcontrol for the purpose of editing
  private get testName(): FormControl {

    return this.testForm?.get('testName') as FormControl;
  }

  // Returns duration formcontrol for the purpose of editing
  private get duration(): FormControl {

    return this.testForm?.get('duration') as FormControl;
  }

  // get options for the particular question as form array
  getOptionsArrayFor(index: number): FormArray {


    return (this.getQuestionAt(index).get('options')) as FormArray;

  }

  disablePreviewInputs(){
    Object.keys(this.testForm?.controls || {}).forEach(key => {
      const control = this.testForm?.get(key);
      control?.disable();
    });


  }

  enablePreviewInputs(){

    Object.keys(this.testForm?.controls || {}).forEach(key => {

      const control = this.testForm?.get(key);
      (key !== 'id') ? control?.disable() : '';

    })
  }



  // initializes pagination information
  private initializePageInfo() {

    this.totalPageIndex = this.questionsArray.length;

    this.paginatedQuestion = this.getQuestionAt(this.currentPageIndex);
    this.initializeOptions();


  }


  // Takes user one-step further the next page
  nextPage() {

    if (this.currentPageIndex < (this.totalPageIndex - 1)) {

      ++this.currentPageIndex;
      this.paginatedQuestion = this.getQuestionAt(this.currentPageIndex);
      this.initializeOptions();

      this.handleOptionValueChanges();
      this.handleAnswerValueChanges();




    } else this.endOfPage = true;



  }

  // Takes user one-step further the previous page
  previousPage() {

    if (this.currentPageIndex > 0) {
      --this.currentPageIndex;

      this.paginatedQuestion = this.getQuestionAt(this.currentPageIndex);


      // calls the method to resubscribe to the observable
      this.handleOptionValueChanges();
      this.handleAnswerValueChanges();



    }


  }

  // gets the currently selected option for a form control in the 'option form array
  private getOption(index: number): string {

    return ((this.getOptionsArrayFor(this.currentPageIndex).at(index)) as FormGroup).get('letter')?.value;


  }

  private initializeOptions() {
    // Clear the options container before adding new options
    this.optionsContainer = [];

    // Get the size of the elements in the options form array of the current question
    const length = this.getOptionsArrayFor(this.currentPageIndex).length;

    // Iterate through the size of options form array, creating options and adding to the optionsContainer
    for (let index = 0; index < length; index++) {
      let option = ['A', 'B', 'C', 'D', 'E'];

      // Remove the current option letter on the form control to avoid redundancy
      option.splice(option.indexOf(this.getOption(index)), 1);

      // Push the available options to the options container
      this.optionsContainer.push(option);
    }
  }
  // Edits the current form 
  edit() {

    this.paginatedQuestion?.enable();
    this.category.enable();
    this.subjectName.enable();
    this.testName.enable();
    this.duration.enable();
    this.editMode = signal(true);

  }

  // SaveChanges method does not actually persist changes made
  // to the form since changes are automatically synced.
  // However, its purpose is to disable further page navigation until
  // the system determines the user has actually made some changes or
  // simply click on the button to alert the system it has completed making changes.
  saveChanges() {

    this.editMode.update(() => !this.editMode())

    
    // disable the current form control after changes are made to avoid futher edit by mistake
    this.paginatedQuestion?.disable();

    this.category.disable();
    this.subjectName.disable();
    this.testName.disable();
    this.duration.disable();

  }

  // checks if the form has error. This is intended to serve for disabling upload or saving current changes for forms with error(s)
  // Due to the fact that some portion of the form is disabled, automatic error check such as (testForm.hasError('errorCode')) does not work.
  // Hence we manually check for errors
  hasError(): boolean {

    // iterate through the form group in the questionArray formArray
    // get the form group at each index
    // iterate through each formControl using their key('formControName')
    //  check if required error is present
    for (let i = 0; i < this.questionsArray.length; i++) {

      const questionGroup = this.questionsArray.at(i) as FormGroup;

      for (let key in questionGroup.controls) {
        if (questionGroup.get(key)?.hasError('required')) return true;
      }

    }

    // get the options form array
    // iterate through each group in the array and check if any control has 'required' error
    const optionsArray = this.getOptionsArrayFor(this.currentPageIndex);
    for (let j = 0; j < optionsArray.length; j++) {

      const optionGroup = optionsArray.at(j) as FormGroup;
      for (let key in optionGroup.controls) {
        if (optionGroup.get(key)?.hasError('required')) return true;
      }
    }

    return false;

  }


  // this method handles the 'valueChange' event each time the user edits the answer.
  // It ensures only required values are accepted
  private handleAnswerValueChanges() {

    // unsuscribe from previous subscription to ensure clean data
    this.answerValueChangeSubscription?.unsubscribe;

    this.answerValueChangeSubscription = this.paginatedQuestion?.get('answer')?.valueChanges.subscribe((value: string) => {

      // If user supplied answer does not match any of the allowed option, erase the answer
      if (/^[A-Ea-e]$/.test(value)) {
        // converts current value to upper case
        const upperCaseValue = value.toUpperCase();
        //  update form control value if necessary
        if (value !== upperCaseValue) {
          this.paginatedQuestion?.get('answer')?.setValue(value.toUpperCase(), { emitEvent: false });//prevent recursive events trigger since we're changing the value inside its own valueChanges observable
        }


      } else this.paginatedQuestion?.get('answer')?.setValue('', { emitEvent: false });
    })
  }

  private handleOptionValueChanges() {

    // unscribes to previously made subscription for a page since we navigate between pages
    this.optionsValueChangeSubscription?.unsubscribe();

    // get the options for the current page index and subscribe to its value changes
    this.optionsValueChangeSubscription = this.getOptionsArrayFor(this.currentPageIndex).valueChanges.subscribe(() => {


      let currentValue = undefined;
      let indexOfSelectedFormGroup:number|undefined;


      // get the options form array and determine the newly selected value and its index
      this.getOptionsArrayFor(this.currentPageIndex).controls.forEach((group, index) => {

        // check the dirty property of the form group
        if (group.dirty) {

          // extract the option letter
          currentValue = group.get('letter')?.value;


          // get the index
          indexOfSelectedFormGroup = index;


          // clear the dirty property of the group to avoid returning redundant value on next subscription
          group.markAsPristine();
        }

      });

      // get from the 'optionsContainer', the previously selected value of the form group,
      // since default selected values are not added in the 'optionContainer', check index that would return negative value

      if (indexOfSelectedFormGroup != undefined) {



        let previouslySelectedOption;
        const currentOptionsContainer = this.optionsContainer[indexOfSelectedFormGroup!];



        ['A', 'B', 'C', 'D', 'E'].forEach(value => {

          if (currentOptionsContainer.indexOf(value) < 0) {

            previouslySelectedOption = value;



          }
        });


        //  replace  currently selcted option in the 'optionsContainer' with the previously selected option, then sort the resulting array.
        this.optionsContainer[indexOfSelectedFormGroup!].splice(currentOptionsContainer.indexOf(currentValue!), 1, previouslySelectedOption!);
        this.optionsContainer[indexOfSelectedFormGroup].sort(this.sortOptions());


      }
    })



  }




  // provides sorting for the options
  private sortOptions(): ((a: string, b: string) => number) {
    return (a, b) => {

      if (a < b) return -1;
      else if (a > b) return 1;
      return 0;
    };
  }

  // Uploads assessment
  uploadNow() {

    this.uploadingStatus.set('busy');

    this.adminService.postAssessment(this.testForm!.value).pipe(take(1)).subscribe({

    
      next: (response: HttpResponse<number>) => {

        // If the response status is 'OK' and we actually got a respone body(typically an id)
        if (response.status == HttpStatusCode.Ok && response.body) {
          this.hasUploaded.set(true);
          this.uploadedAssessmentId = response.body;
          // Announce a task completion milestone of 1 to indicate a milestone has been reached so far
          // This event is received at the AdminComponent to update the mat-stepper step progress

          this.adminService.setTaskMilestone(1);
        }
      },

      error: (err) => {

        // TODO: SHOW ERROR MESSAGE ON THE PAGE

        console.log(err)
        this.uploadingStatus.set('nil')
      }


    })

   


  }

}
export type Option = { text: string | undefined; letter: string | undefined }