import { Component, computed, effect, inject, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { ConfirmationService } from "../../../services/confirmation.service";
import { take } from 'rxjs';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  FormControlDirective,
  PaginationComponent,
  RowComponent,
  SpinnerComponent,
  TableDirective,
  ToasterComponent,
  ToastBodyComponent,
  ToastComponent,
  ToastHeaderComponent,
  PageItemComponent,
  PageLinkDirective,
  DropdownComponent,
  DropdownItemDirective,
  DropdownMenuDirective,
  DropdownToggleDirective
} from '@coreui/angular';
import { NumericDirective } from '../../../directives/numeric.directive';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationComponent } from '../../../util/confirmation.component';
import { cilSortAlphaDown} from '@coreui/icons';
import { IconModule } from '@coreui/icons-angular';

@Component({
  selector: 'app-assessment-info',
  templateUrl: './assessment-info.component.html',
  styleUrls: ['./assessment-info.component.scss'],
  standalone: true,
  imports: [
    RowComponent,
    ColComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    TableDirective,
    SpinnerComponent,
    PaginationComponent,
    PageItemComponent,
    PageLinkDirective,
    ButtonDirective,
    FormControlDirective,
    FormsModule,
    ToasterComponent,
    ToastComponent,
    ToastHeaderComponent,
    ToastBodyComponent,
    CommonModule,
    NumericDirective,
    ConfirmationComponent,
    DropdownComponent,
 DropdownToggleDirective,
 DropdownMenuDirective,

IconModule,
DropdownItemDirective,
 RouterOutlet

   
  ]
})
export class AssessmentInfoComponent {
  private activatedRoute = inject(ActivatedRoute);
  private adminService = inject(AdminService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);

  cilSortAlphaDown = cilSortAlphaDown


  
  loadingState: WritableSignal<'nil'|'busy'> = signal('nil');
  categoryId: WritableSignal<number|undefined> = signal(undefined);
  editingMode = signal(false);
  editingId: WritableSignal<number|undefined> = signal(undefined);
  showSuccessToast = signal(false);
  successMessage = signal('');

  
  currentPage = signal(1);
  pageSize = signal(4);
  totalItems = signal(0);
  private currentCategoryId?:number;

  private collator = new Intl.Collator('en');

  
  assessments: Assessment[] = [];
  paginatedAssessments: Assessment[] = [];

  pageCount = computed(() => Math.ceil(this.totalItems() / this.pageSize()));

  constructor() {

  
    effect(() => {
      if (this.categoryId()) {
        this.fetchAssessments(this.categoryId()!);
      }
    });

    this.activatedRoute.params.subscribe(params => {
      this.categoryId.set(Number(params['categoryId']));

      this.currentCategoryId = Number(params['categoryId'])
    });
  }

  private fetchAssessments(categoryId: number) {
    this.loadingState.set('busy');
    this.adminService.fetchAssessmentInfo(categoryId).pipe(take(1)).subscribe({
      next: (info: AssessmentInfo) => {
        if (info) {
          this.assessments = info._embedded.subjects.map(data => ({
            subjectId: data.id,
            subjectName: data.subjectName,
            tests: data.test
          }));
          this.totalItems.set(this.assessments.length);
        
          this.sortData(this.assessments)
          this.updatePagination();
        } else {
          this.assessments = [];
          this.totalItems.set(0);
        }
        this.loadingState.set('nil');
      },
      error: () => this.loadingState.set('nil')
    });
  }

  private sortData(assessments:Assessment[]){

    assessments.sort((a, b) => {

      const subjectNameCompare = this.collator.compare(a.subjectName, b.subjectName);

      if(subjectNameCompare !== 0) return subjectNameCompare;

      return 0

    })
  }

  private updatePagination() {
    const startIndex = (this.currentPage() - 1) * this.pageSize();
    const endIndex = startIndex + this.pageSize();
    this.paginatedAssessments = this.assessments.slice(startIndex, endIndex);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.updatePagination();
  }

  fetchQuestions(testId: number, topic:string) {

    
  this.router.navigate([testId, topic],{relativeTo:this.activatedRoute})
  
  }

  saveChanges(topic: string, duration: number, id: number) {
    this.editingMode.set(false);
    const modifying = { topic, duration };
    this.adminService.modifyAssessment(modifying, id).subscribe({
      next: () => {
        this.successMessage.set('Changes saved successfully!');
        this.showSuccessToast.set(true);
        setTimeout(() => this.showSuccessToast.set(false), 3000);
      },
      error: (err) => {
        this.router.navigate(['/error', err.error]);
      },
      complete: () => {

        this.editingId.set(undefined);
        this.fetchAssessments(this.currentCategoryId!)
      }
    });
  }

  getPageNumbers(): number[] {
    const totalPages = this.pageCount();
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  editTest(testId: number) {
    this.editingMode.set(true);
    this.editingId.set(testId);
  }

  cancelEdit() {
    this.editingMode.set(false);
    this.editingId.set(undefined);
  }

  delete(testId: number, testName: string) {
    this.confirmationService.confirmAction(`Delete ${testName}?`);
    this.confirmationService.userConfirmationResponse$.pipe(take(1)).subscribe(yes => {
      if (yes) {
        this.deleteAssessment(testId);
      }
    });
  }

  private deleteAssessment(testId: number) {
    this.adminService.deleteAssessment(testId).subscribe({
      error: (error) => this.router.navigate(['/error', error.error]),
      complete: () => this.fetchAssessments(this.categoryId()!)
    });
  }

  sortBy(criteria: string) {

    console.log(`criteria ${criteria}`)
   
    this.assessments.sort((a, b) => {

      switch(criteria) {
        case 'subjectName':
          return a.subjectName.localeCompare(b.subjectName);
        case 'subjectNameDesc':
          return b.subjectName.localeCompare(a.subjectName);
        default:
          return 0;
      }
    });
    this.currentPage.set(1); // Reset to first page when sorting
    this.updatePagination();
  }
}

interface AssessmentInfo {
  _embedded: {
    subjects: Array<{
      id: number,
      subjectName: string,
      test: Array<{id: number, testName: string, duration: number}>
    }>
  }
}

type Assessment = {
  subjectId: number,
  subjectName: string,
  tests: Array<{id: number, testName: string, duration: number}>
};