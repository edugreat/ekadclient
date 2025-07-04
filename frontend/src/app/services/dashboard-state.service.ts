import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardStateService {

  private hideStepperSubject = new BehaviorSubject<boolean>(false);

  hideStepper$ = this.hideStepperSubject.asObservable();

  constructor() { }


  set hideStepper(flag:boolean){

    this.hideStepperSubject.next(flag);
  }

 
}
