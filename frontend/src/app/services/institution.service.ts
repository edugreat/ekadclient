import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { HttpClient, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { ApiEndpoints } from '../api/api-endpoints';
import { Region } from '../util/regions';
import { ApiResponseObject } from '../util/api.response';

@Injectable({
  providedIn: 'root'
})
export class InstitutionService {
  
  

  private apiEndpoints = inject(ApiEndpoints);
  private http = inject(HttpClient);
  private regionalStates:Region[] = [];

  // provides cache for all institutions reistered by a given admin
  private registeredInstitutions = new Map<number, Institution[]>()

  
   registerInstitution(institution: Institution):Observable<HttpResponse<number>> {

    return this.http.post<HttpStatusCode>(this.apiEndpoints.admin.register, institution, {'observe':"response"})
   
  }

  getRegisteredInstitutions(adminId: number):Observable<Institution[]> {

   return this.http.get<Institution[]>(this.apiEndpoints.admin.institutions, { headers:{'adminId':`${adminId}`}}).pipe(
    tap(val => this.registeredInstitutions.set(adminId, val))
   );

  }

  public getInstitutions(adminId:number):Institution[] | undefined{

    return this.registeredInstitutions.get(adminId);
  }

  addStudentRecords(selectedInstitution: number, records: any[]):Observable<HttpResponse<number>> {

    return this.http.post<HttpStatusCode>(this.apiEndpoints.admin.registerStudent, records, {
      headers:{
        'institutionId':`${selectedInstitution}`
      },
      'observe':'response'
    })
   

  }

  public getRegions():Observable<Region[]>{

  if(this.regionalStates.length){

    return of(this.regionalStates);

  }

    return this.http
           .get<ApiResponseObject<Region[]>>(this.apiEndpoints.admin.regions).pipe(

            map((response) => {
              if(!response.success || !response.data){

                throw new Error(response.error || 'Unknown Error')
              }

              return response.data;
            }),
            catchError((err) => {

              throw new Error(err.message || 'Failed to fetch States');
            })
          )

}

  
}

// an object of Institution (especially secondary school with basic information required to register it on the app)
export interface Institution {

  id:number,
  name:string,
  createdOn?:Date,
  state?:string,
  localGovt?:string,
  createdBy?:number,
  students?:string[],
  studentPopulation?:number

}


