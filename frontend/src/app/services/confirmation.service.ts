import { Injectable } from '@angular/core';
import { finalize, Observable, Subject, take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {

  
  private actionMessageConfirmSubject = new Subject<string|undefined>();
  actionMessageConfirm$ = this.actionMessageConfirmSubject.asObservable();

  private confirmationResponseSubject = new Subject<boolean>();
  confirmationResponse$ = this.confirmationResponseSubject.asObservable();
  constructor() { }

  //emits the confirmation message
  confirmAction(message:string):Observable<boolean>{

    this.actionMessageConfirmSubject.next(message);

    return this.confirmationResponse$.pipe(
      take(1),
      finalize(() => this.actionMessageConfirmSubject.next(undefined))
    );

   
  }

  //emits user confirmation response
  confirmationResponse(response:boolean){

   this.confirmationResponseSubject.next(response);

  }
}