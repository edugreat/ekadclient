import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
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
import { distinctUntilChanged, filter, map, Observable, startWith, Subject, take, takeUntil } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { initial } from 'lodash-es';

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
export class AssessmentViewComponent implements OnInit, OnDestroy {
  categories: Category[] = [];
  errorMessage?: string = undefined;
  isLoading =  signal(false);
  selectedCategory?: Category;
  noDataMessage?: string;

  private adminService = inject(AdminService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private currentUrl = signal<string|undefined>(undefined);
  private destroy$ = new Subject<void>();
  private readonly urlPattern1 =  /^\/assessments\/\d+\/?$/;
  private readonly urlPattern2 =  /^\/assessments\/topics\/\d+\/?$/;


  
  ngOnInit(): void {

    // determines which of the child components should be routed to
   this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      startWith(this.router),
      map(() => this.router.url),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(url => this.currentUrl.set(url));
   

    this.fetchAssessmentCategories();

    
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.unsubscribe();
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

   
    if(this.currentUrl())
{
  if(this.currentUrl() === '/assessments'||this.urlPattern1.test(this.currentUrl()!) ){

    console.log(`routes to assessments: ${this.currentUrl()}`)
       this.router.navigate([category.id],{relativeTo:this.activatedRoute})
    }
    if(this.currentUrl() === '/assessments/topics'){

      console.log(`routes to topics: ${this.currentUrl()}`)

      this.router.navigate(['/assessments/topics', category.id])
    }else if(this.urlPattern2.test(this.currentUrl()!)){

    console.log(`routes to topic: ${this.currentUrl()}`)

      this.router.navigate(['/assessments/topics', category.id])
    }
   
}  
 
  }
}