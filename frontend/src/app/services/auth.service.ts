import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, WritableSignal } from '@angular/core';
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

  private currentUserSubject = new BehaviorSubject<User|undefined>(undefined);
  public currentUserOb$ = this.currentUserSubject.asObservable();

   currentUser:WritableSignal<User|undefined> = signal(undefined);
  

  // This flag is used to stop anyother requests from proceeding while refresh token process is ongoing, until it completes
  private _refreshTokenInProcess = false;

  public loadResources = signal(true);
 
  constructor() {
   
   }

  login(email:string, password:string, role:string):Observable<User>{

    return this.http.post<User>(`${this.apiEndpoints.auth.signIn}?role=${role}`, 
      { email:`${email}`, password:`${password}`}
    ).pipe(tap(user => {
      this.loggedInUserSubject.next(user);
      this.getGroupChatJoinDates(user);
      this.currentUserSubject.next(user);
      this.currentUser.set(user)
      this.currentUsernameSubject.next(`${user.firstName}`);
    }))

  }

  // returned redis cached object of loggedin user from the server
  getCachedUser(userId:string):Observable<User>{

    return this.http.get<User>(`${this.apiEndpoints.auth.cachedUser}?cache=${userId}`).pipe(tap(user => {
    
      if(!user){

       
       this.logout(userId);

       return;
      }

    
      this.currentUserSubject.next(user);
      this.currentUser.set(user)
      this.getGroupChatJoinDates(user);
      this.loggedInUserSubject.next(user);
      this.currentUsernameSubject.next(`${user.firstName}`);

    }));

  }

  public setReloadState(reload:boolean){

    this.loadResources.set(reload)

  }

  logout(userId:string):Observable<void>{

    return this.http.post<void>(this.apiEndpoints.auth.disconnect, {
      headers:{id:userId}
    }).pipe(tap(() => {
      this.postLogoutResets();
    }));
  

  

  }

  private postLogoutResets() {

    this.currentUserSubject.next(undefined);
    sessionStorage.clear();
    this.loggedInUserSubject.next(undefined);
    this.groupJoinDateSubject.next(undefined);
    this.currentUsernameSubject.next(undefined);
  }

   // requests for new token when the existing token has expired
   requestNewToken():Observable<User>{


    const refreshToken = sessionStorage.getItem('refreshToken');
    return this.http.post<User>(`${this.apiEndpoints.auth.refreshToken}`,{'refreshToken':refreshToken}).pipe(
      tap(user => this.getGroupChatJoinDates(user))
    )

   }
   

  private getGroupChatJoinDates(user:User){
   

  if(this.isStudent(user) && user.isGroupMember){
   this.groupJoinedDate(user.id).pipe(take(1)).subscribe();

  }

}

public get isSuperAdmin(){

  return this.currentUser() ? this.currentUser()!.roles.map(r => r.toLowerCase()).includes('superadmin') : false;
}

 get isAdmin(){

  return this.currentUser() ? this.currentUser()!.roles.map(r => r.toLowerCase()).includes('admin') : false;;
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
