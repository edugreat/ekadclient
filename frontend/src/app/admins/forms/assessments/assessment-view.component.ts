import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import {
  ButtonDirective,
  CardComponent,
  CardBodyComponent,
  CardHeaderComponent,
  ColComponent,
  DropdownComponent,
  DropdownItemDirective,
  DropdownMenuDirective,
  DropdownToggleDirective,
  SpinnerComponent,
  TextColorDirective} from '@coreui/angular';
import { AdminService, AssessmentCategory } from '../../../services/admin.service';
import { take } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

type Category = {
  id: number,
  category: string
}

@Component({
  selector: 'app-assessment-view',
  templateUrl: './assessment-view.component.html',
  styleUrls: ['./assessment-view.component.scss'],
  imports: [
    CommonModule,
    RouterOutlet,
   
    ColComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    DropdownComponent,
    DropdownToggleDirective,
    DropdownMenuDirective,
    DropdownItemDirective,
    ButtonDirective,
    TextColorDirective,
    SpinnerComponent,
   
   
   
    //RouterLink
  ],
  standalone: true
})
export class AssessmentViewComponent implements OnInit {
  categories: Category[] = [];
  errorMessage?: string = undefined;
  isLoading =  signal(false);
  selectedCategory?: Category;
  noDataMessage?: string;

  private adminService = inject(AdminService);
  private activatedRouter = inject(ActivatedRoute)
  private router = inject(Router)

  ngOnInit(): void {
    this.fetchAssessmentCategories();
  }

  private fetchAssessmentCategories() {
    this.isLoading.set(true);
    this.errorMessage = undefined;
    this.noDataMessage = undefined;

    this.adminService.fetchAssessmentCategories().pipe(take(1))
      .subscribe({
        next: (value: AssessmentCategory) => {
          if (value && value._embedded?.levels?.length > 0) {
            this.categories = value._embedded.levels.map(info => ({
              id: info.id,
              category: info.category
            }));
        
          } else {
            this.noDataMessage = 'No assessment categories found.';
          }
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = error.message || 'Failed to fetch categories';
        },
        complete: () => {
          this.isLoading.set(false);
        }
      });
  }

  selectCategory(category: Category) {
    this.selectedCategory = category;

   

    this.router.navigate([category.id],{relativeTo:this.activatedRouter})
  }
}