import { inject, Injectable } from '@angular/core';
import { ApiEndpoints } from '../api/api-endpoints';
import { Observable } from 'rxjs';
import { HttpClient, HttpResponse, HttpStatusCode } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SubjectService {
 
  private apiEndpoints = inject(ApiEndpoints);

  private http = inject(HttpClient);

  constructor() { }


  uploadSubjects(subjects: Subject[]):Observable<HttpResponse<number>> {
   

    return this.http.post<HttpStatusCode>(`${this.apiEndpoints.admin.subjects}`, subjects, {observe:'response'})
  }
}

export interface Subject{

  id:number;
  subjectName:string;
  category:string
}
