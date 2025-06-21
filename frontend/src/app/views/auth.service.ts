import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiEndpoints } from '../api/api-endpoints';
import { BehaviorSubject, Observable, of, take, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);
  private apiEndpoints = inject(ApiEndpoints);

  private loggedInUserSubject = new BehaviorSubject<User|undefined>(undefined);

  loggedInUserObs$ = this.loggedInUserSubject.asObservable();

  private groupJoinDateSubject = new BehaviorSubject<Map<number, Date> | undefined>(undefined);
  groupJoinDateObs$ = this.groupJoinDateSubject.asObservable();

  private currentUsernameSubject = new BehaviorSubject<string | undefined>(undefined);

  public userName$ = this.currentUsernameSubject.asObservable();

  // This flag is used to stop anyother requests from proceeding while refresh token process is ongoing, until it completes
  private _refreshTokenInProcess = false;

  constructor() { }

  login(email:string, password:string, role:string):Observable<User>{

    return this.http.post<User>(`${this.apiEndpoints.auth.signIn}?role=${role}`, 
      { email:`${email}`, password:`${password}`}
    ).pipe(tap(user => {
      this.loggedInUserSubject.next(user);
      this.saveToSessionStorage(user);
      this.currentUsernameSubject.next(`${user.firstName}`);
    }))

  }

  // returned redis cached object of loggedin user from the server
  getCachedUser(cacheKey:string):Observable<User>{

    return this.http.get<User>(`${this.apiEndpoints.auth.cachedUser}?cache=${cacheKey}`).pipe(tap(user => {
    
      if(!user){
       this.logout();

       return;
      }

      this.saveToSessionStorage(user);
      this.loggedInUserSubject.next(user);
      this.currentUsernameSubject.next(`${user.firstName}`);

    }));

  }

  logout():Observable<void>{

     const cachedKey = sessionStorage.getItem('cachingKey');
   if(cachedKey){
    return this.http.post<void>(this.apiEndpoints.auth.disconnect, {
      headers:{id:cachedKey}
    }).pipe(tap(() => {
      this.postLogoutRest();
    }));
   }

   return of(undefined).pipe(tap(() => {
    this.postLogoutRest();
   }))

  }

  private postLogoutRest() {
    sessionStorage.clear();
    this.loggedInUserSubject.next(undefined);
    this.groupJoinDateSubject.next(undefined);
    this.currentUsernameSubject.next(undefined);
  }

   // requests for new token when the existing token has expired
   requestNewToken():Observable<User>{


    const refreshToken = sessionStorage.getItem('refreshToken');
    return this.http.post<User>(`${this.apiEndpoints.auth.refreshToken}`,{'refreshToken':refreshToken}).pipe(
      tap(user => this.saveToSessionStorage(user))
    )

   }
   

  private saveToSessionStorage(user:User){
    sessionStorage.setItem('user', JSON.stringify(user));
  
    sessionStorage.setItem("logged", "yes");
    sessionStorage.setItem('cachingKey', String(user.id));

    sessionStorage.setItem('accessToken', user.accessToken);
   
    // sets the refresh token once as it serves only for requesting new tokens
    if(!sessionStorage.getItem('refreshToken')){

      sessionStorage.setItem('refreshToken', user.refreshToken);
   
  }

  if(this.isStudent(user) && user.isGroupMember){
   this.groupJoinedDate(user.id).pipe(take(1)).subscribe();

  }

}

private groupJoinedDate(userId:number):Observable<Map<number, Date>>{
  return this.http.get<Map<number, Date>>(`${this.apiEndpoints.chat.groupJoinDate}?id=${userId}`)
  .pipe(tap(joinDate => {
    this.groupJoinDateSubject.next(joinDate);
   
  }));

}

public get refreshTokenInProcess(){

  return this._refreshTokenInProcess;
}


public set refreshTokenInProcess(inProcess:boolean){

  this._refreshTokenInProcess = inProcess
}
  private isStudent(user:User){

    return user.roles.includes('Student');

  }
}

export interface User{

  id:number,
  firstName:string,
  lastName:string,
  mobileNumber: string,
  email:string,
  statusCode:number,
  status:string //SENIOR or JUNIOR
  accessToken:string,
  refreshToken:string,
  signInErrorMessage:string,
  isGroupMember:boolean,
  roles:string[],
  
}
