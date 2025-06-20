import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegisterationService {

  private http = inject(HttpClient);

  private signUpUrl = 'http://localhost:8080/auth/sign-up';
  

  constructor() { }

  registerUser(userData:StudentRegisterationData):Observable<number>{

    return this.http.post<number>(`${this.signUpUrl}`, userData);

  }
}

export interface StudentRegisterationData{

  firstName: string;
  lastName: string;
  email: string;
  mobileNumber?: string;
  status: 'junior' | 'senior';
  password: string;
  repeatPassword: string;
 
  
}
