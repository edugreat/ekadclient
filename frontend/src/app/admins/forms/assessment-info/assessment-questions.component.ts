import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, effect, inject, OnInit, signal } from '@angular/core';
import { MathJaxDirective } from '../../../util/math-jax.directive';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService} from '../../../services/admin.service';
import { ConfirmationService } from '../../../services/confirmation.service';
import { take } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { cilSortAlphaDown, cilPencil, cilTrash, cilWarning, cilActionUndo } from '@coreui/icons';
import { IconModule } from '@coreui/icons-angular';
import { AlertComponent, CardBodyComponent, CardComponent, CardHeaderComponent, ColComponent, DropdownComponent, PageItemComponent, PageLinkDirective, PaginationComponent, RowComponent, SpinnerComponent, TooltipDirective } from '@coreui/angular';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationComponent } from '../../../util/confirmation.component';
import { cloneDeep, isEqual } from 'lodash-es';

@Component({
  selector: 'app-assessment-questions',
  imports: [

    CommonModule,
    MathJaxDirective,
    FormsModule,
    IconModule,
    ColComponent,
    RowComponent,
    CardComponent,
    CardBodyComponent,
    CardHeaderComponent,
    PaginationComponent,
    PageItemComponent,
    PageLinkDirective,
    SpinnerComponent,
    DropdownComponent,
    ConfirmationComponent,
    ReactiveFormsModule,
    TooltipDirective,
    AlertComponent

  ],
  templateUrl: './assessment-questions.component.html',
  styleUrl: './assessment-questions.component.scss'
})
export class AssessmentQuestionsComponent implements OnInit, AfterViewInit {

  
 errorMessage?:string;
  private adminService = inject(AdminService);
  private confirmationService = inject(ConfirmationService);
  private activatedRoute = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  
  editForm!:FormGroup;


  



  
  showUndo = signal(false);
 
  isDropdownOpen = false;

  disableSendBtn = signal(false);

  // holds state of form control input before editing gets initiated.
  // It is used to revertt back should user declines continuing the process
  private previousObjState?:Question;

  private idOfEditableQuestion?:number;
 

  private questions:Question[] = [];
  currentIndex = 0;
  totalQuestions = 0;

 pageSize = signal(5);

  paginatedQuestions?:Question[];

  editableQuestion?:Question;

  currentQuestionNumber?:number;

  private updatedQuestions:Question[] = [];

  busyState = signal<'nil'|'busy'>('nil');

  assessmentTopic = signal<undefined|string>(undefined)
   testId = signal<undefined|number>(undefined);
  

  cilSortAphaDown = cilSortAlphaDown;
  cilPencil = cilPencil;
  cilTrash = cilTrash;
  cilWarning = cilWarning;
  cilActionUndo = cilActionUndo;

  constructor(){

    effect(() =>{
     if(this.testId() && this.assessmentTopic()){
   
      this.fetchQuestions(this.testId()!)
      
     }

    })

    this.activatedRoute.params.subscribe(params => {

      const id = params['testId'];
      const topic = params['topic'];

      if(id && topic){

        this.testId.set(Number(id));
        this.assessmentTopic.set(topic);
      }

    })

  }


  ngOnInit(): void {

    this.initializeForm()

    
    


  }

  ngAfterViewInit(): void {
  
  }

  private initializeForm(){
    this.editForm = this.fb.group({
      question: ['', Validators.required],
      answer: ['', Validators.required],
      options: this.fb.array([])
    });

   
    // this.editForm.valueChanges.subscribe(() => {
    //   this.showUndo.set(true);
    // });
  }

  get optionsArray():FormArray{

    return this.editForm.get('options') as FormArray;
  }


  private fetchQuestions(testId:number){

    this.currentIndex = 0;
    this.totalQuestions = 0;
   this.pageSize = signal(5)

    this.busyState.set('busy');

    this.adminService.fetchQuestionsForTestId(testId).pipe(take(1))
    .subscribe({
      next:(data) =>{

        this.questions = data._embedded.questions.map((question: { id: any; questionNumber: any; question: any; answer: any; options: any; }) => ({

          id:question.id,
          questionNumber:question.questionNumber,
          question:question.question,
          answer:question.answer,
          options:question.options
        }))
      },

      error:(error:HttpErrorResponse) => {
      this.errorMessage = error.message;
      },

      complete:() => {
        this.totalQuestions = this.questions.length;
        this.setPagination();
        this.busyState.set('nil')
      

      }
      
    })
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  private setPagination(){


    const endIndex = this.currentIndex+this.pageSize();
    this.paginatedQuestions = ((this.currentIndex + this.pageSize()) <= this.totalQuestions) ? (this.questions.slice(this.currentIndex, endIndex)) : this.questions.slice(this.currentIndex);
  // set current page to a value = highest index of paginated questions
  this.currentIndex += this.pageSize()

  }

  nextPage(){

   
    this.setPagination();
  }

  getPageNumbers(): number[] {
    const totalPages = Math.ceil(this.totalQuestions / this.pageSize());
    return Array.from({length: totalPages}, (_, i) => i + 1);
  }

  undoChanges(){

  //   this.showUndo.set(false)

  //  this.editableQuestion = undefined;
  //  this.editForm.reset();
  this.resetObjects()

  }


  previousPage(){
    const endIndex = this.currentIndex - this.pageSize();
    // start index must be greater than or equal to zero
    const startIndex = (endIndex - this.pageSize()) > 0 ? (endIndex - this.pageSize()) : 0;
    
    this.paginatedQuestions = this.questions.slice(startIndex, endIndex);
    this.currentIndex = endIndex;
      }


      isActive(page: number): boolean {
        const startIndex = (page - 1) * this.pageSize();
        return this.currentIndex === startIndex;
      }
      
      goToPage(page: number) {
        this.currentIndex = (page - 1) * this.pageSize();
        this.setPagination();
      }
      
      isFormValid(): boolean {
        if (!this.editableQuestion) return false;
        
        const hasEmptyQuestion = !this.editableQuestion.question.trim();
        const hasEmptyAnswer = !this.editableQuestion.answer.trim();
        const hasEmptyOptions = this.editableQuestion.options.some(opt => !opt.text.trim());
        
        return !hasEmptyQuestion && !hasEmptyAnswer && !hasEmptyOptions;
      }
      
      sortBy(criteria: string) {
        this.currentIndex = 0;
        this.questions = [...this.questions].sort((a, b) => {
          switch(criteria) {
            case 'questionNumber': 
              return a.questionNumber - b.questionNumber;
            case 'question':
              return a.question.localeCompare(b.question);
            case 'answer':
              return a.answer.localeCompare(b.answer);
            default:
              return 0;
          }
        });
        this.setPagination();
      }
      
    
    
      editQuestion(id:number) {


         // kick in and check for uncommited changes
        if(this.previousObjState){

           
        const changes:Question = this.editForm.value;

        const hasChanged = !isEqual(this.previousObjState, changes);

        if(hasChanged){

          this.confirmationService.confirmAction('save changes?').subscribe(save => {
          if(save){

            this.saveChangesToDatabase()


          }

        })

       
        }
        return;

        }
      
    
        
      const question = this.paginatedQuestions!.filter(q => q.id === id)[0];
      if(question)
      {
        this.idOfEditableQuestion = id;
        
       
        this.currentQuestionNumber = question.questionNumber;

        this.cloneObject(question);

        // clear existing options
        while(this.optionsArray.length){
          this.optionsArray.removeAt(0);
        }

        this.editForm.patchValue({
          question:question.question,
          answer: question.answer
        });

        // add options
        question.options.forEach(option => {

          this.optionsArray.push(this.fb.group({

            letter:[option.letter],
            text:[option.text, Validators.required]
          }));
        });

        this.editForm.valueChanges.pipe(take(1)).subscribe(v => {

          console.log('form value changes')

          this.showUndo.set(true)
        })


        this.editableQuestion = question;

    
      }        
        }
    
        cancelEdit() {

          Object.assign(this.questions.filter(q => q.id === this.idOfEditableQuestion)[0], this.previousObjState);
          
            this.resetObjects();
          
          }
    
 
     private resetObjects() {
   

    this.idOfEditableQuestion = undefined;
    this.previousObjState = undefined;
    this.editForm.reset();
    this.showUndo.set(false);
    this.editableQuestion = undefined;
    this.idOfEditableQuestion = undefined;
  }

        // deletes from the assessment, the question whose question number is given.
        deleteQuestion(questionNumber:number, questionId:number) {
    
        
    
          this.confirmationService.confirmAction(`Delete number ${questionNumber} ?`).subscribe(approved =>{
    
            if(approved){
           // Remove the question from the paginated questions array
          this.paginatedQuestions?.splice(this.paginatedQuestions.findIndex(q => q.questionNumber === questionNumber), 1);
    
        
           if(this.testId()!){
            this.busyState.set('busy');
    
            this.adminService.deleteQuestion(Number(this.testId()!), questionId).subscribe({
      
              error:(err:HttpErrorResponse) => {
  
                this.errorMessage = err.message;
              },
  
              complete:() => {
  
                this.fetchQuestions(this.testId()!)
              }
            })
           }
      
            }
          })
          
        }

       cloneObject(editableQuestion:Question) {

        this.previousObjState = cloneDeep(editableQuestion);
        
        }

       
    
    
        // save update changes
        saveChanges() {
          if (this.editForm.invalid) {
            this.errorMessage = 'Please fill all required fields';
            return;
          }
      
          this.confirmationService.confirmAction("save current changes?").subscribe(confirmed => {
            if (confirmed) {
              this.saveChangesToDatabase();
            }
          });
        }

  private saveChangesToDatabase() {
    this.disableSendBtn.set(true);

    // Create updated question from form values
    const formValue = this.editForm.value;
    const updatedQuestion: Question = {
      id: this.idOfEditableQuestion!,
      questionNumber: this.currentQuestionNumber!,
      question: formValue.question,
      answer: formValue.answer,
      options: formValue.options
    };

    this.updatedQuestions.push(updatedQuestion);

    if (this.testId()) {
      this.busyState.set('busy');
      this.adminService.updateQuestions(this.updatedQuestions, Number(this.testId())).subscribe({
        error: (err: HttpErrorResponse) => {
          console.log(err);
          this.errorMessage = err.message;
          this.disableSendBtn.set(false);
        },
        complete: () => {
          this.editableQuestion = undefined;
          this.resetObjects();
          this.disableSendBtn.set(false);
          this.busyState.set('nil');
          this.updatedQuestions = [];
          this.fetchQuestions(this.testId()!);
        }
      });
    }
  }
}

type Question = {

  id:number,
  questionNumber:number,
  question:string,
  answer:string,
  options:Array<{text:string,letter:string}>
}
