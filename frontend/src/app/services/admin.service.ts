import { HttpClient, HttpResponse, HttpStatusCode} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, finalize, map, Observable, of, tap } from 'rxjs';
import { ApiEndpoints } from '../api/api-endpoints';
import { ApiResponseObject } from '../util/api.response';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
 
  // Observable that emits the number of tasks completed
  // This is itended to use in a mat-stepper to indicate progress on tasks such as assessment upload, result uploads tasks etc
  private taskMilestone = new BehaviorSubject<number>(0);

   taskMilestoneObs$ = this.taskMilestone.asObservable();

  // Emits the name of task at hand
  private task = new BehaviorSubject<string>('');

  taskObs$ = this.task.asObservable();

  private apiEndpoints = inject(ApiEndpoints)
 private http = inject(HttpClient);
 private assessmentTopicCache:AssessmentTopic[] = [];
 private assessmentCategoriesCache?:AssessmentCategory;
 private studentListCache?:StudentInfo;
 private subjectObjectCache?:SubjectObject;
 
 private assessmentQuestionCache:Question[] = []
 private assessmentNames:string[] = [];
 



  

  constructor() { }

  //Fetches from the database, all the assessment categories
  fetchCategories():Observable<any>{

    return this.http.get<CategoryObject>(this.apiEndpoints.learning.levels);
  }

  //uses the url 'subjects.href' url returned from the call to the fetchCategory to fetch all the subjects in that category
  fetchSubjects(url:string):Observable<any>{

    if(this.subjectObjectCache){

      return of(this.subjectObjectCache)
    }
    return this.http.get<SubjectObject>(url);
  }

  // fetches a paginated view of student list sorting the list by student's first name and last name all in ascending order 
  fetchStudentList(page?:number, pageSize?:number, status?:string):Observable<StudentInfo>{

    if(status){

      return this.http.get<_StudentInfo>(`${this.apiEndpoints.learning.searchByStatus}?status=${status}`).pipe(
        map((data) => {
          return {students: data._embedded.students, page: data.page}
        })
      )
    }

    return this.http.get<_StudentInfo>(`${this.apiEndpoints.learning.students}?page=${page}&size=${pageSize}&sort=firstName,asc&sort=lastName,asc`).pipe(
      map((data) =>{

        const studentInfo:StudentInfo = {
          students:data._embedded.students,
          page: data.page

        }
      
        return studentInfo;
      }),
     
    )
    
    
  }

 
  // method that posts new created assessment to the server
  postAssessment(test:TestDTO):Observable<HttpResponse<number>>{

    return this.http.post<HttpStatusCode>(this.apiEndpoints.admin.test, test,{
      observe:'response',
     });


  }

  // post or associate instructional guide to a just posted assessment
  uploadInstructions(instruction: {instructions:[]}, id:number):Observable<HttpResponse<number>>{

    return this.http.patch<HttpStatusCode>(`${this.apiEndpoints.admin.test}?id=${id}`, instruction ,{observe:'response'})


  }

  // Service for disabling student's account
  disableStudentAccount(studentId:number):Observable<HttpResponse<number>>{



    return this.http.patch<HttpStatusCode>(`${this.apiEndpoints.admin.disable}`, {'studentId':studentId},{observe:'response'});

  }

  clearStudentListCache(){

    this.studentListCache?.students.splice(0);
  }

  removeFromCache(studentId:number){

      const index = this.studentListCache?.students.findIndex(s => s.id === studentId);

      if(index && index >= 0){
        this.studentListCache?.students.splice(index, 1);
      }
  }


  // Enables student's account
  enableStudentAccount(studentId: number):Observable<HttpResponse<number>> {

    return this.http.patch<HttpStatusCode>(`${this.apiEndpoints.admin.enable}`, {"studentId": studentId}, {observe:'response'})
   
  }

// fetches student's assessment performance information for the student with the given student id
fetchStudentPerformanceInfo(studentId:number):Observable<StudentPerformance[]>{


  return this.http.get<StudentPerformanceInfo>(`${this.apiEndpoints.learning.students}/${studentId}/studentTests`).pipe(
   
    map((info) => {
     return info._embedded.StudentTests
  
     
    })
  )

}

// fetches the names assessments for the given studentTestIds
fetchAssessmentNames(studentTestIds:number[]):Observable<string[]>{

  if(this.assessmentNames.length) return of(this.assessmentNames);
  
  return this.http.get<ApiResponseObject<string[]>>(`${this.apiEndpoints.admin.assessmentNames}`,
  {
    headers:{
      'studentTestIds':`${studentTestIds}`
    }
  }
  ).pipe(
    map((response) => {
      if(!response.success || ! response.data){

        throw new Error(response.error || 'Unable to fetch assessments')
      }

      this.assessmentNames = response.data;

      return response.data;
    }),

     catchError((err) => {
          throw new Error(err.message || 'Failed to fetch topics');
        })
  )
  
}


// feches all assessment topics for the given assessment level and subject name
public fetchAssessmentInfo(categoryId:number):Observable<AssessmentInfo>{

  return this.http.get<AssessmentInfo>(`${this.apiEndpoints.learning.levels}/${categoryId}/subjects`)
}

// fetches all assessment categories from the server
public fetchAssessmentCategories(page?:number, pageSize?:number):Observable<AssessmentCategory>{

  if(this.assessmentCategoriesCache){

    return of(this.assessmentCategoriesCache)
  }

  if(page && pageSize) return this.http.get<AssessmentCategory>(`${this.apiEndpoints.learning.levels}?page=${page}&size=${pageSize}&sort=firstName,asc&sort=lastName,asc`);

  return this.http.get<AssessmentCategory>(`${this.apiEndpoints.learning.levels}?sort=category,asc`);
}

// method that fetches all the questions for the given test id
public fetchQuestionsForTestId(testId:number):Observable<Question[]>{

  if(this.assessmentQuestionCache.length){

    return of(this.assessmentQuestionCache)
  }
  return this.http.get<any>(`${this.apiEndpoints.learning.tests}/${testId}/questions`).pipe(
    map((data) => data._embedded.questions as Question[])
  )
}

public deleteStudent(studentId:number):Observable<HttpResponse<number>>{

 

  return this.http.delete<HttpStatusCode>(`${this.apiEndpoints.admin.delete}?studentId=${studentId}`,{observe:'response'})
}

updateQuestions(questions:any, testId:number):Observable<HttpResponse<number>>{

  this.assessmentQuestionCache = []


  return this.http.put<HttpStatusCode>(`${this.apiEndpoints.admin.updateQuestion}?testId=${testId}`, questions, {observe:'response'})
}


modifyAssessment(modifying:{topic:string, duration:number}, assessmentId:number):Observable<HttpResponse<number>>{
  
  return this.http.patch<HttpStatusCode>(`${this.apiEndpoints.admin.modifyTest}?assessmentId=${assessmentId}`, modifying, {observe:'response'});
}

 deleteQuestion(testId:number, questionId:number):Observable<HttpResponse<number>>{

  this.assessmentQuestionCache = []

  return this.http.delete<HttpStatusCode>(`${this.apiEndpoints.admin.deleteQuestion}?testId=${testId}&questionId=${questionId}`,{observe:'response'});
 }


 deleteAssessment(testId: number):Observable<HttpResponse<number>> {

  return this.http.delete<HttpStatusCode>(`${this.apiEndpoints.admin.assessment}?testId=${testId}`, {observe:"response"})
  
}

// calls the server endpoint to return all assessment topics for editing or deletion purpose
 getAssessmentTopics(categoryId: number): Observable<AssessmentTopic[]> {

  if(this.assessmentTopicCache.length){

    return of(this.assessmentTopicCache);
  }
    return this.http
      .get<ApiResponseObject<AssessmentTopic[]>>(`${this.apiEndpoints.admin.topics}?category=${categoryId}`)
      .pipe(
       
        map((response) => {
          if (!response.success || !response.data) {
            throw new Error(response.error || 'Unknown error');
          }
          return response.data;
        }),
        catchError((err) => {
          throw new Error(err.message || 'Failed to fetch topics');
        })
      );
  }

// service that calls the server endpoint to update an assessment topic. 
// object passed to the method is a key-value object where the key is the oldValue used to uniquely retrieve the assessment topic from the database, and the value is new value used to update the topic
updateAssessementTopic(keyValueObj:{assessmentId:number, categoryId:number, currentName:string}):Observable<HttpResponse<number>> {

this.assessmentTopicCache = [];
this.assessmentQuestionCache = [];
  return this.http.patch<HttpStatusCode>(`${this.apiEndpoints.admin.topics}`, keyValueObj,{observe:'response'})
}


deleteAssessmentTopic(assessmentId:number, categoryId:number):Observable<HttpResponse<number>> {

  this.assessmentTopicCache = [];
  return this.http.delete<HttpStatusCode>(`${this.apiEndpoints.admin.topics}?category=${categoryId}&assessmentId=${assessmentId}`,{observe:'response'})
  
}

// service that calls the server endpoint to retrieve all assessment subject names in a key-value object,
// where key is the category assessment belongs to and value is a list of subject names under the category
assessmentSubjects():Observable<{[key:string]:Array<string>}> {



  return this.http.get<{[key:string]:Array<string>}>(`${this.apiEndpoints.admin.subjects}`)
 
}

// calls the server api passing a key-value object, where key is the assessment category and value is the subject name used to update old name
updateSubjectName(editedObject: { [key: string]: string; }, oldSubjectName:string):Observable<HttpResponse<number>> {
  
  return this.http.patch<HttpStatusCode>(`${this.apiEndpoints.admin.updateSubjectName}?oldName=${oldSubjectName}`,editedObject, {observe:'response'})
}

// calls the server endpoint passing values(category and subjectName) to delete the given subject name
deleteSubject(category:string, subjectName:string):Observable<HttpResponse<number>> {
  

  return this.http.delete<HttpStatusCode>(`${this.apiEndpoints.admin.deleteSubject}?category=${category}&subjectName=${subjectName}`, {observe:'response'});
}

// communicates to the backend to update name of the category referenced by 'previousName' with 'currentName'
updateCategoryName(currentName:string, previousName: string):Observable<HttpResponse<number>> {
 
  this.assessmentCategoriesCache = undefined;
  
  return this.http.patch<HttpStatusCode>(`${this.apiEndpoints.admin.updateCategory}?previousName=${previousName}`, currentName, {observe:'response'});


}

uploadAssessmentCategories(categories:Category[]):Observable<HttpResponse<number>>{

  return this.http.post<HttpStatusCode>(this.apiEndpoints.admin.postCategory, categories, {'observe':'response'});


}

// communicates to the server to delete the assessment category referenced by 'category'
deleteCategory(category: number):Observable<HttpResponse<number>> {
  
  this.assessmentCategoriesCache = undefined;
  return this.http.delete<HttpStatusCode>(`${this.apiEndpoints.admin.deleteCategory}?category=${category}`, {observe:'response'})

}
  // set task's milestone to the current value
   setTaskMilestone(value:number):void{


    this.taskMilestone.next(value);
  }

  // Sets description about the task at hand
  taskDescription(name:string){

    this.task.next(name);
  }

 
  // This is used to reset task's milestone after each task completion
  resetMilestone(){
 this.taskMilestone.next(0);

 }

// sends notifications to the students
sendNotifications(notification: NotificationDTO, institutionId?: number):Observable<HttpResponse<void>>{

  return this.http.post<void>(this.apiEndpoints.admin.notify, notification,
    
    {
      observe:'response',
    
    headers:{
      'institutionId': institutionId ? `${institutionId}` : '0' 
    }
  
  }
  
  );
}

}

//an object of the 'levelUrl' HATEAOS
export interface CategoryObject{

  _embedded:{
   levels:Array<links>
  }
}

type  links = 
  {
   category:string,
   _links:{
    subjects:{
      href:string
    }
   }
  }

  export interface SubjectObject{

    _embedded:{
      subjects:Array<{subjectName:string}>
    }
  }

  // Student information returned by the hateos link
  export interface _StudentInfo{

    _embedded:{

      students:Array<Student>

      },
      page:{
        size:number,
        totalElements:number,
        totalPages:number,
        number:number
    }
  } 
export interface Student{

  id:number,
  firstName:string,
  lastName:string,
  email:string,
  status:string,
  mobileNumber:string,
  accountCreationDate:string,
  accountEnabled:boolean,
  lockedAccount:boolean,

  
}

export interface StudentInfo {

  students:Student[],
  page:{
    size:number,
    number:number
    totalElements:number,
    totalPages:number
  }

}



// An interface representing student's performance information on assessments they had taken
export interface StudentPerformanceInfo{

  _embedded:{

    StudentTests:Array<StudentPerformance>
  }


}

// An interface representing students performance in an assessment
export interface StudentPerformance{
  id:number,
  score:number,
  grade:string,
  when:string
}

// An interface representing a basic assessment information for a given assessment level and subject
export interface AssessmentInfo{

  _embedded:{

    subjects:Array<{id:number, subjectName:string, test:Array<{id:number, testName:string, duration:number}>}>
  }
}

// An interface representing assessment category received form the server (such as SENIOR AND JUNIOR)
export interface AssessmentCategory{

  _embedded:{
    levels:Array<Category>
  },
  page:{
    size:number,
    totalElements:number,
    totalPages:number,
    number:number
  }
}

// DTO of notification forwarded to the server for data persistence of the just created notification
export type NotificationDTO = {
  metadata:number, // describes id of what we are notifying about
  type:string, // describes type of notification(e.g assessment upload etc)
  message?:string, // overview description about the notification
  audience:string[]  // who the notification is target to
  }

  //Declares an object of type Question
export type Question = {
  id?:number,
  questionNumber:number|undefined,
  question:string|undefined,
  answer:string|undefined,
  options:Array<{text:string|undefined,letter:string|undefined}>
}



//Declares an object of type TestDTO that is sent to the server
export type TestDTO = {
  id: number | null;
  category: string | undefined;
  subjectName: string | undefined;
  testName: string | undefined;
  duration: number | undefined;
  questions: Question[];
  institutionId?: number

};

export type Category = {

  id:number,
  category:string
}

export type AssessmentTopic = {

    assessmentId:number,
    topic: string
}
