import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  private scrollAssessmentInfoSubject = new Subject<boolean>();
  scrollAssessmentInfo$ = this.scrollAssessmentInfoSubject.asObservable();

  private scrollQuestionSubject = new Subject<boolean>();
  scrollQuestion$ = this.scrollQuestionSubject.asObservable();

  constructor() { }

  scrollAssessmentInfo(flag:boolean){

    this.scrollAssessmentInfoSubject.next(flag);
  }

  scrollQuestion(flag:boolean){

    this.scrollQuestionSubject.next(flag);
  }

  scrollIntoView(element:HTMLElement){

     try {
    element.scrollIntoView({ behavior: 'smooth', block: 'end' });
  } catch (e) {
    
    element.scrollIntoView();
  }
  }
}
