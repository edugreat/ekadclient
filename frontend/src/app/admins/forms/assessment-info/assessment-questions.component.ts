import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, OnInit, signal } from '@angular/core';
import { MathJaxDirective } from '../../../util/math-jax.directive';
import { FormsModule } from '@angular/forms';
import { AdminService} from '../../../services/admin.service';
import { ConfirmationService } from '../../../services/confirmation.service';
import { take } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { cilSortAlphaDown, cilPencil, cilTrash } from '@coreui/icons';
import { IconModule } from '@coreui/icons-angular';
import { CardBodyComponent, CardComponent, CardHeaderComponent, ColComponent, DropdownComponent, PageItemComponent, PageLinkDirective, PaginationComponent, RowComponent, SpinnerComponent } from '@coreui/angular';
import { ActivatedRoute } from '@angular/router';

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
    DropdownComponent

  ],
  templateUrl: './assessment-questions.component.html',
  styleUrl: './assessment-questions.component.scss'
})
export class AssessmentQuestionsComponent implements OnInit {

  
 errorMessage?:string;
  private adminService = inject(AdminService);
  private confirmationService = inject(ConfirmationService);
  private activatedRoute = inject(ActivatedRoute);
  isDropdownOpen = false;
 

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
    
        
      const question = this.paginatedQuestions!.filter(q => q.id === id)[0];
        this.editableQuestion = question;
        this.currentQuestionNumber = question.questionNumber;
    
        
        }
    
        cancelEdit() {
          
          this.editableQuestion = undefined;
          }
    
        // deletes from the assessment, the question whose question number is given.
        deleteQuestion(questionNumber:number, questionId:number) {
    
          this.confirmationService.confirmAction(`Delete number ${questionNumber} ?`);
    
          this.confirmationService.userConfirmationResponse$.pipe(take(1)).subscribe(approved =>{
    
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
    
    
        // save update changes
        saveChanges() {
    
         if(this.editableQuestion){
          this.updatedQuestions.push(this.editableQuestion);
    
         }
          
          this.editableQuestion = undefined; 
    
          const testId = this.testId;
         
          if(testId){

            this.busyState.set('busy')
    
            this.adminService.updateQuestions(this.updatedQuestions, Number(testId)).subscribe({
    
            
    
              error:(err:HttpErrorResponse) => {
    
                console.log(err);
              
                this.errorMessage = err.message;
    
                
              },
    
              complete:() => {

                this.updatedQuestions = [] //resets this array after successfully persisting to the database

                this.fetchQuestions(this.testId()!);
              }
            })
          
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
