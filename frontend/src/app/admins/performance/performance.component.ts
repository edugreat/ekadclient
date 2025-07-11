import { Component, effect, ElementRef, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { AdminService, Student, StudentInfo } from '../../services/admin.service';
import { ConfirmationService } from '../../services/confirmation.service';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { finalize, Subscription, take } from 'rxjs';
import { HttpErrorResponse, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AnalyticsComponent } from '../performance/analytics/analytic.component';
import { 
  CardComponent, 
  CardBodyComponent, 
  CardHeaderComponent,
  ButtonDirective,
  SpinnerComponent,
  ToasterComponent,
  ToastComponent,
  ToastHeaderComponent,
  ToastBodyComponent,
  BadgeComponent,
  ListGroupModule
} from '@coreui/angular';
import { IconComponent } from '@coreui/icons-angular';
import { StudentCategory } from '../../util/student.category';
import { UtilService } from 'src/app/util/util.service';

@Component({
  selector: 'app-performance',
  imports: [
    CommonModule,
    CardComponent,
    CardBodyComponent,
    CardHeaderComponent,
    ButtonDirective,
    SpinnerComponent,
    ToasterComponent,
    ToastComponent,
    ToastHeaderComponent,
    ToastBodyComponent,
    IconComponent,
    ListGroupModule,
    BadgeComponent,
    IconComponent,
   
    RouterOutlet
],
  templateUrl: './performance.component.html',
  styleUrl: './performance.component.scss'
})
export class PerformanceComponent implements OnInit, OnDestroy {


  

  private adminService = inject(AdminService);
  private confirmService = inject(ConfirmationService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private utilService = inject(UtilService);

  // stored just clicked 'analytics' button for style updates to know button just clicked
  clickedBtn?:number

  isLoading = signal(false);
  pageSize = signal(10);
  showErrorToast = false;
  errorMessage = '';
  students:Student[] = [];
  statuses:string[] = [];
  pagination = {
    currentPage:0,
    totalPages:1,
    totalElements:0
  }

  sortField = 'firstName';
  sortDirection = 'asc';
  private statusFilter =  signal<string|null>(null);

   @ViewChild('routerOutlet')
  private routerOutlet?:ElementRef;

  private scrollSub?:Subscription;
  

  constructor(){

    effect(() => {

      if(this.statusFilter()!== null){
        if(this.statusFilter() !== 'all'){
        this.getStudents(undefined, this.statusFilter()!)
        }else{

          this.getStudents()
        }
        
      }
    })

   this.scrollSub =  this.utilService.scrollChart$.subscribe(scroll => {

     setTimeout(() => {
      
       if(scroll && this.routerOutlet){

        
        this.utilService.scrollIntoView(this.routerOutlet.nativeElement);
      }

     }, 100);

     
    })
  }

  ngOnInit(): void {
    
    this.activatedRoute.paramMap.subscribe(() => {
    setTimeout(() => {
        this.getStudents(undefined, undefined);
    }, 600);
    })
  }
  ngOnDestroy(): void {

    this.scrollSub?.unsubscribe();
   
  }


  private getStudents(pageNumber?:number, status?:string){

    this.clearPreviousData();

    this.isLoading.set(true);
    
    this.adminService.fetchStudentList(pageNumber, this.pageSize(), status).pipe(
      take(1),
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next:(data:StudentInfo) => {
       this.students = data.students;
       this.updateStatus()
       this.pagination = {
          currentPage: data.page.number,
          totalPages: data.page.totalPages,
          totalElements: data.page.totalElements
        };
      },

      error:(err:HttpErrorResponse) => {

        this.errorMessage = err.message || 'Failed to load students';
      
          this.showErrorToast = true;
        setTimeout(() => this.showErrorToast = false, 5000);
      }
    })

  }

  clearPreviousData(){

    this.clickedBtn = undefined;
  }
  private updateStatus(){
   this.statuses = this.statuses.length ? this.statuses : [...new Set(this.students.map(s => s.status))]
    
  }

  toggleSort(field:string){

    if(field){
      this.sortField = field;

      this.sortDirection = this.sortDirection === 'asc' ? 'desc':'asc';
      
    }

     this.sortStudents(this.sortField, this.sortDirection);

  }

  private sortStudents(sortField:string, sortDirection:string){

    if(sortField === 'firstName'){

      switch (sortDirection) {
        case 'asc':
          this.students.sort((a , b) => a.firstName.localeCompare(b.firstName))
          
          break;
          case 'desc':
            this.students.sort((a , b) => b.firstName.localeCompare(a.firstName))
            break;
      }
    }else if(sortField === 'lastName'){

      switch (sortDirection) {
        case 'asc':
          this.students.sort((a, b) => a.lastName.localeCompare(b.lastName))
          break;

          case 'desc':
            this.students.sort((a, b) => b.lastName.localeCompare(a.lastName))
            break;
      
        default:
          break;
      }
    }else{

      switch (sortDirection) {
        case 'asc':

        this.students.sort((a, b) => a.status.localeCompare(b.status))
          
          break;

          case 'desc':
            this.students.sort((a ,b) => b.status.localeCompare(a.status))
            break;
      
     
      }
    }
  }

  getStatusBadgeColor(status: string): string|undefined {

    switch(status){
      case StudentCategory.JUNIOR:

      return 'warning'

      case StudentCategory.SENIOR:
        return 'success'

    }

    return ''
    

}

    changePage(page: number) {
    this.getStudents(page);
  }

  filterByStatus(event: Event) {

    const selectElement = event.target as HTMLSelectElement;

    const selectedStatus = selectElement.value;
    this.statusFilter.set(selectedStatus);

}


  deleteAccount(studentId:number){
  
    this.confirmService.confirmAction('Do you mean to delete to delete this account ?').subscribe(approve => {
      if(approve){

        this.isLoading.set(true);
       this.adminService.deleteStudent(studentId).pipe(take(1),
      finalize(() => this.getStudents(0))
      
      )
       .subscribe({

        next:(response:HttpResponse<number>) =>{

          if(response.status === HttpStatusCode.Ok){
            this.adminService.removeFromCache(studentId);
          }

        },
        error:(err:HttpErrorResponse) => {

          this.errorMessage = err.message;
        }
       })

      }


    })

  }

  disableAccount(studentId:number){

    this.confirmService.confirmAction('Disable this account ?').subscribe(approve => {

      if(approve){

        this.isLoading.set(true);

        this.adminService.disableStudentAccount(studentId).pipe(
          take(1),
        finalize(() =>  this.getStudents(0))
        )
        .subscribe({
          next:(response:HttpResponse<number>)=>{

            if(response.status === HttpStatusCode.Ok){
             
             this.adminService.clearStudentListCache();

            }
          }
        })


      }
    })
  }

  enableAccount(studentId:number){

    this.confirmService.confirmAction('enable account ?').subscribe(approve => {

      if(approve){

        this.isLoading.set(true);
        this.adminService.enableStudentAccount(studentId).pipe(
          take(1),
          finalize(() => this.getStudents(0))
        ).subscribe({

          next:(response:HttpResponse<number>) =>{

            if(response.status === HttpStatusCode.Ok){

            this.adminService.clearStudentListCache();
            }
          }
        })
      }
    })
  }

  getAnalytics(studentId:number, btnIndex:number){

    this.clickedBtn = btnIndex;

    this.router.navigate([studentId], {relativeTo: this.activatedRoute})
  }


}


