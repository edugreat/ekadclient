import { Component, computed, inject, OnDestroy, OnInit, signal, Signal } from '@angular/core';
import { FormBuilder, FormControl, Validators, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AdminService, CategoryObject, Question, SubjectObject, TestDTO } from '../../services/admin.service';
import {NumericDirective} from '../../directives/numeric.directive';
import {Institution, InstitutionService} from '../../services/institution.service'
import { User, AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import {MatOption} from '@angular/material/core';
import { MatFormField, MatInput } from '@angular/material/input';
import { MatSelect, MatSelectChange} from '@angular/material/select';
import { MatLabel } from '@angular/material/form-field';
import { MatTooltip } from '@angular/material/tooltip';

import {
  cilSpreadsheet,
  cilTask,
  cilPlus,
  cilPencil
} from '@coreui/icons';


// CoreUI Angular Directives
import {
  ButtonDirective,
  FormDirective,
  GutterDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { RouterLink } from '@angular/router';
import { PreviewTestComponent } from './preview-test.component';
import { DashboardStateService } from '../../services/dashboard-state.service';

@Component({
  selector: 'app-test-upload',
  imports: [
    // CoreUI
    ButtonDirective,
    
    FormDirective,
  
    GutterDirective,
    IconDirective,

    MatLabel,
    MatOption,
    MatInput,
   
   
    MatSelect,
    MatTooltip,
    
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    
    RouterLink,

    // Custom
    NumericDirective,
    MatFormField,
    PreviewTestComponent,
  ],

  
  templateUrl: './test-upload.component.html',
  styleUrl: './test-upload.component.scss'
})
export class UploadTestComponent implements OnInit, OnDestroy {

  private adminService = inject(AdminService);
  private institutionService = inject(InstitutionService);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private dashboardStateService = inject(DashboardStateService)
 
  
  //cloud = cilCloudUpload;
  spread = cilSpreadsheet;
  task = cilTask;
 // list = cilListRich;
   plus = cilPlus;
  // glass = cilMagnifyingGlass;
   pencil = cilPencil;

  //an array of test categories received from the server
  // This is used to prepopulate the subject selection input so admin can make a choice that subsequently instantiate the necessary form control
  categories?: string[];

  //an array of test subject received from the server.
  // This is used to prepopulate the category selection input so admin can make a choice that subsequently instantiate the necessary form control
  subjectNames: string[] = [];

  //An array of number used to prepopulate the duration input selection
  durations = [20, 25, 30, 35, 40, 45, 50, 55, 60];

  //An array of alphabets used to prepopulate the option input selection
  options = ['A', 'B', 'C', 'D', 'E'];

  // An array of options form which correct answers could bt selected
  answers = ['A', 'B', 'C', 'D', 'E'];

  //An array of 50 numbers used to prepopulate question number input selection
  numberRange?: number[];

  //boolean flag that determines the display of the edit button for adding the number of questions for the test
  nonEditable = true;

  // declare an object of TestDTO and initialize to undefined
  testDTO?: TestDTO;

  //  an array of institutions registered by or identifiable with the given admin
  myInstitutions: Institution[] = [];

  // signal that signals the number of options already provided for a particular question number
  // Once the number of options have reached five ie [A-E], that current question number is removed from view
  private optionCounter = signal(0);

  // signal that keeps counts of the number of questions already provided.
  // Once it gets to the number of indicated questions set by the admin, the upload button is made visible, and the 'add' button is hidden
  private counter = signal(Number.MAX_VALUE as number);

  // indicates that all quesions have been set and can now set the instructional guide
  taskCompleted: Signal<boolean> = computed(() => this.counter() === 0);


  // boolean flag for previewing the test
  previewTest = false;

  // instance of current user
  private currentUser?: User;

  private currentUserSub?: Subscription;



  // Signals that the form should be reset(basicaaly deactivated) after all questions have been set. Now we can set the instructions without updating the form
  disableOnCompletion: Signal<boolean> = computed(() => {
    if (this.taskCompleted()) {
      this.testUploadForm.get('category')!.reset();
      this.testUploadForm.get('subject')!.reset();
      this.testUploadForm.get('title')!.reset();
      this.testUploadForm.get('duration')!.reset();

      return true;
    } else return false;
  });

  // declares an instruction form group to hold all instructional guides to the test
  selectedInstitution?: Institution;
  studentPopulation?: number = Number.MAX_SAFE_INTEGER; //the population of students for the selected institution

  constructor() {

    
   }

  //Test form for collecting basic information about the test from the admin
  testUploadForm = this.fb.group({
    id: new FormControl<number>(0), //placeholder to avoid exception on the server, though ID is generated by the database.

    category: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: Validators.required,
    }),

    subject: new FormControl<string | undefined>(
      { value: undefined, disabled: true },
      {
        nonNullable: true,
        validators: Validators.required,
      }
    ),

    title: new FormControl<string | undefined>(
      { value: undefined, disabled: true },
      {
        nonNullable: true,

        validators: Validators.required,
      }
    ),
    duration: new FormControl<string | undefined>(
      { value: undefined, disabled: true },
      {
        nonNullable: true,
        validators: Validators.required,
      }
    )
  });

  // Question form for collecting qustions from the admin
  questionForm = new FormGroup({
    total: new FormControl<string | undefined>(
      { value: undefined, disabled: true },
      {
        nonNullable: true,
        validators: Validators.required,
      }
    ),

    index: new FormControl<string | undefined>(
      { value: undefined, disabled: true },
      {
        nonNullable: true,
        validators: Validators.required,
      }
    ),

    question: new FormControl<string | undefined>(
      { value: undefined, disabled: true },
      {
        nonNullable: true,
        validators: Validators.required,
      }
    ),

    answer: new FormControl(
      { value: undefined, disabled: true },
      {
        nonNullable: true,
        validators: Validators.required,
      }
    ),
  });

  // Form for collecting options for each question asked
  optionForm = new FormGroup({
    letter: new FormControl<string | undefined>(
      { value: undefined, disabled: true },
      {
        nonNullable: true,
        validators: Validators.required,
      }
    ),
    text: new FormControl<string | undefined>(
      { value: undefined, disabled: true },
      {
        nonNullable: true,
        validators: Validators.required,
      }
    ),
  });

  ngOnInit(): void {

    this.dashboardStateService.hideStepper = false;

    this._currentUser();


  }

  ngOnDestroy(): void {

    this.currentUserSub?.unsubscribe();
  }

  // get the object of logged in user
  private _currentUser() {

    this.currentUserSub = this.authService.loggedInUserObs$.subscribe(user => {

      if(user){

        this.currentUser = user;
        this._myInstitutions(this.currentUser.id)
      }else{
        console.log('no current user')
      }
    })

  }




  processInstitutionChange($event: MatSelectChange) {

    if (!this.isSuperAdmin) {

      // dynamically set the target institution based on user's interaction with the input selection
      this.testDTO!.institutionId = $event.value ? ($event.value as Institution).id : 0

      if (!$event.value) this.studentPopulation = undefined;

      else if ($event.value) {

        this.studentPopulation = this.selectedInstitution?.studentPopulation
          ?
          this.selectedInstitution.studentPopulation
          :
          undefined;
      }
    }

  }



  //get the data required for test upload. Such data include the test category and the subject for which the Test is intended
  private fetchTestUploadInfo() {
    this.adminService.fetchCategories().subscribe({
      next: (data: CategoryObject) => {

        //assign the array of levels returnd from this server call to the 'category' property
        this.categories = data._embedded.levels.map((level) => level.category);

        // get link to the subject for the given category(level)
        const urls: string[] = data._embedded.levels.map(
          (level) => level._links.subjects.href
        );

        urls.forEach((url) => this.fetchSubject(url));
      },
      error: (err) => console.log(err),
      complete: () => { }
    });
  }

  private fetchSubject(url: string) {
    return this.adminService
      .fetchSubjects(url)

      .subscribe({
        next: (data: SubjectObject) => {

          //assign to the subject array property, the returned subject name array of this server
          const subject: string[] = data._embedded.subjects.map(
            (subjectName) => subjectName.subjectName
          );
          this.subjectNames.push(...subject);
        },

        error: (err) => console.log(err),

        complete: () => this.removeDuplicateSubjectNames(this.subjectNames.sort(this.sortSubjectList))
      })



  }

  get isSuperAdmin() {

    return this.authService.isSuperAdmin;
  }

  // Since we're storing subjects for both senior & junior into a single array, there's need to remove duplicates if any exists.
  removeDuplicateSubjectNames(subjectNames: string[]) {


    let size = subjectNames.length;
    for (let index = 0; (index + 1) < size; index++) {


      if (subjectNames[index + 1].toLowerCase() === subjectNames[index].toLowerCase()) {
        subjectNames.splice(index, 1);
        --size;
      }



    }
  }

  

  private _myInstitutions(adminId: number) {

    this.institutionService.getRegisteredInstitutions(adminId).subscribe({
      next: (value: Institution[]) => {



        if (value.length === 1) {
          this.selectedInstitution = value[0];

          //  super admins are given the privilege to set assessments for students which might not necessarily be of their institutions
          if (!this.isSuperAdmin) {

            this.studentPopulation = this.selectedInstitution.studentPopulation;
          }
        }

        this.myInstitutions = value

        this.fetchTestUploadInfo();
      },
      complete: () => {
        this.adjustFormStatus();
        // Set current task description to 'upload'
        // This event is received by the AdminComponet to trigger mat-stepper progress for the 'upload' task
        this.adminService.taskDescription('upload-test');
      }
    })
  }

  // Sorts subject list in asceding alphabetical order

  private sortSubjectList(x: string, y: string): number {
    const x1 = x.toLowerCase();
    const x2 = y.toLowerCase();

    if (x1 < x2) return -1;
    else if (x1 > x2) return 1;
    else return 0;
  }

  //populate the numberRange array
  private fillNumberRange() {
    //initialize numberRange array to the size indicate by the 'total' input field

    this.numberRange = new Array(Number(this.questionForm.get('total')!.value));

    for (let index = 1; index <= this.numberRange.length; index++) {
      this.numberRange[index - 1] = index;
    }

    //  sets the counter signal to the value of 'numberRange' indicating the number of questions to set
    this.counter.set(this.numberRange!.length);
  }

  // dynamically enable or disable some part of the forms depending on the current state of other part of the for.
  //For instance, when category is yet to get selected, other parts of the form should be disabled
  private adjustFormStatus() {


    if (!this.selectedInstitution && !this.isSuperAdmin) {

      this.categoryInput.disable();
    } else {

      this.categoryInput.enable()
    }

    //reset the form groups each time the user makes changes on the selected category
    this.categoryInput.valueChanges.subscribe((currentValue) => {
      this.subjectInput.reset();
      this.titleInput.reset();
      this.durationInput.reset();
      this.questionForm.reset();
      this.optionForm.reset();
      //enable or continue to disable the next field (subject input field) depending on the current value of is field
      currentValue !== undefined
        ? this.subjectInput.enable()
        : this.subjectInput.disable();
    });



    //reset all inputs below the subject input each time there is a change in the subject selection
    this.subjectInput.valueChanges.subscribe((currentValue) => {
      this.titleInput.reset();
      this.durationInput.reset();
      this.questionForm.reset();
      this.optionForm.reset();
      //enable or continue to disable the next field (title input field) depending on the current value of is field
      currentValue !== undefined ? this.titleInput.enable() : this.titleInput.disable();
    });

    this.titleInput.valueChanges.subscribe((currentValue) => {
      this.durationInput.reset();
      this.questionForm.reset();
      this.optionForm.reset();
      //enable or continue to disable the next field (title input field) depending on the current value of is field
      currentValue !== undefined && currentValue.length
        ? this.durationInput.enable()
        : this.durationInput.disable();
    });

    this.durationInput.valueChanges.subscribe((currentValue) => {
      this.questionForm.reset();
      this.optionForm.reset();
      currentValue !== undefined ? this.totalInput.enable() : this.totalInput.disable();
    });

    this.totalInput.valueChanges.subscribe(() => {
      this.indexInput.reset();
      this.questionInput.reset();
      this.answerInput.reset();
      this.optionForm.reset();
      // (currentValue !==  undefined && currentValue.length) ? indexInput.enable() : indexInput.disable();
    });

    this.indexInput.valueChanges.subscribe((currentValue) => {
      this.questionInput.reset();
      this.answerInput.reset();
      this.optionForm.reset();
      currentValue !== undefined
        ? this.questionInput.enable()
        : this.questionInput.disable();
    });

    this.questionInput.valueChanges.subscribe((currentValue) => {
      this.answerInput.reset();
      this.optionForm.reset();
      currentValue !== undefined && currentValue.length
        ? this.answerInput.enable()
        : this.answerInput.disable();
    });

    this.answerInput.valueChanges.subscribe((currentValue) => {
      this.optionForm.reset();
      currentValue !== undefined ? this.optionInput.enable() : this.optionInput.disable();
    });

    this.optionInput.valueChanges.subscribe((currentValue) => {
      this.optionTextInput.reset();
      currentValue !== undefined && currentValue.length
        ? this.optionTextInput.enable()
        : this.optionTextInput.disable();
    });
  }

  private get idInput() {

    return this.testUploadForm.get('id')!;
  }
  private get categoryInput() {

    return this.testUploadForm.get('category')!;
  }

  private get subjectInput() {

    return this.testUploadForm.get('subject')!;
  }

  private get titleInput() {

    return this.testUploadForm.get('title')!;
  }

  private get durationInput() {

    return this.testUploadForm.get('duration')!;
  }

  private get totalInput() {

    return this.questionForm.get('total')!;
  }

  private get indexInput() {

    return this.questionForm.get('index')!;
  }

  private get questionInput() {

    return this.questionForm.get('question')!;
  }

  private get answerInput() {

    return this.questionForm.get('answer')!;
  }

  private get optionInput() {

    return this.optionForm.get('letter')!;
  }

  private get optionTextInput() {

    return this.optionForm.get('text')!;
  }

  // Method that adds or edits the number of questions for the particular test
  // When it serves the add functionality, the input field for the number of questions is disables.
  // When it serves the edit functionality, the input field for the number of questions is enables
  addOrEdit() {
    if (this.nonEditable) {
      this.totalInput.disable();
      this.indexInput.enable();
      this.fillNumberRange(); //dynamically adjust number of questions to the value of the 'total' input field
      this.nonEditable = !this.nonEditable;
    } else if (!this.nonEditable) {
      this.totalInput.enable();
      this.nonEditable = !this.nonEditable;
      this.indexInput.disable();
    }
  }

  get disableAddOrEditBtn(){

    const totalQuestions = this.totalInput.value;

  if(!totalQuestions) return true;

  return Number(totalQuestions) <= 0;



  }

  // processess the addition of questions and options once admin clicks on the add button
  processAddition() {
    // get the current question number
    const currentNumber: number = Number(this.indexInput.value);

    //  reference to the chosen option
    const chosenOption = this.optionInput.value;

    //checks if the testDto has yet to be initialized

   const text = this.currentOption().text;
   const letter = this.currentOption().letter;
    let currentOption: { text: string ; letter: string  } = { text: text!, letter:letter!}
    if (!this.testDTO ) {
      //get the current question
      let currentQuestion: Question = this.currentQuestion(currentNumber);
 
      //get the option for the current question
     
      //add current option to an array of options

      // push option to the current question
      currentQuestion.options?.push(currentOption);

      //Initialize testDto
      this.testDTO = {
        id: this.idInput.value,
        category: this.categoryInput.value,
        subjectName: this.subjectInput.value,
        testName: this.titleInput.value,
        duration: Number(this.durationInput.value),
        questions: [currentQuestion],
        institutionId: this.myInstitutions.length === 1 ? this.myInstitutions[0].id : 0
      };

      //sets the optionCounter to 1 indicating an option has been added for question number one
      this.optionCounter.update(() => this.optionCounter() + 1);
    } else {
      //check if the question number already exists
      const exists = this.testDTO.questions.some(
        (question) => question.questionNumber === currentNumber
      );
      if (exists && currentOption) {
        //get the option
        

        //get the question whose options are to be updated
        const question: Question = this.testDTO.questions.find(
          (question) => question.questionNumber === currentNumber
        )!;

        //  get index of the question we intend to update its options
        const index = this.testDTO.questions.findIndex((q) => q === question);

        //  push option to question's options array
        question.options?.push(currentOption);

        //  updates testDto object
        this.testDTO.questions.splice(index, 1, question);

        //updates optionCounter by one
        this.optionCounter.update(() => this.optionCounter() + 1);
      } else {
        //the question number does not exist yet
        //get the question
        const currentQuestion = this.currentQuestion(currentNumber);
        //get option
        const option = this.currentOption();

        currentQuestion.options?.push(option);

        this.testDTO.questions.push(currentQuestion);

        //updates  optionCounter by one
        this.optionCounter.update(() => this.optionCounter() + 1);
      }
    }

    //resets the option form after each supply of options
    this.optionForm.reset();

    if (this.optionCounter() > 0 && this.optionCounter() < 5) {
      this.options.splice(
        this.options.findIndex((option) => option === chosenOption),
        1
      );
    } else {
      // Options for a particular question has been provided, hence decrement the counter value
      this.counter.update(() => this.counter() - 1);

      // Repopulate the options
      this.options = ['A', 'B', 'C', 'D', 'E'];

      this.numberRange!.splice(this.numberRange!.indexOf(currentNumber), 1);
      this.optionCounter.set(0);

      // Reset both the value of the current question number
      this.indexInput.reset();


    }
  }

  //returns the current question
  private currentQuestion(currentNumber: number): Question {
    const currentQuestion: Question = {
      questionNumber: currentNumber,
      question: this.questionInput.value,
      answer: this.answerInput.value,
      options: [],
    };

    return currentQuestion;
  }

  //returns the current option
  private currentOption(): Option {


    const currentOption: Option = {
      letter: this.optionInput.value,
      text: this.optionTextInput.value,
    };

    return currentOption;
  }


  get adminId() {

    return this.currentUser!.id;
  }


  preview() {


    this.previewTest = true;

  }


}

export type Option = { text: string | undefined; letter: string | undefined }


