import { Component, inject, OnInit, signal } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { AdminService, Category } from '../../services/admin.service';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { CardModule, FormModule, ButtonModule, AlertModule, GridModule } from '@coreui/angular';
import { CommonModule } from '@angular/common';
import { DashboardStateService } from '../../services/dashboard-state.service';
import { IconModule } from '@coreui/icons-angular';

@Component({
  selector: 'app-assessment-category',
  imports: [
    CardModule, 
    FormModule, 
    ButtonModule, 
    AlertModule,
    GridModule,
   CommonModule,
   ReactiveFormsModule,
   IconModule
  ],
  templateUrl: './assessment-category.component.html',
  styleUrl: './assessment-category.component.scss'
})
export class AssessmentCategoryComponent implements OnInit {
 
  categoryForm: FormGroup;
  categories: Category[] = [];
  isAdding = signal(false);
  isSubmitting = signal(false);
  errorMessage: string | null = null;
  successMessage: string | null = null;
   invalidInput = false;
   private regex = /["'\s]+/g

  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private dashboardState = inject(DashboardStateService);
 

  constructor(
   
  ) {
    this.dashboardState.hideStepper = true;
   // this.iconSet.icons = {cilLoopCircular, cilCloudUpload, cilTrash}
    this.categoryForm = this.fb.group({
      id: [this.generateId()],
      categoryName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]]
    });
  }

  ngOnInit(): void {
   
    this.onCategoryNameChange()
  }

  generateId(): number {
   return Math.floor(Math.random() * 100);
  }

  addCategory(): void {
    if (this.categoryForm.invalid) return;

    this.isAdding.set(true);
    const newCategory:Category = {
      id: this.categoryForm.value.id,
      category: this.categoryForm.value.categoryName.trim()
    };

    // Simulate API delay
    setTimeout(() => {
     this.addAndSort(newCategory);
      this.categoryForm.reset({
        id: this.generateId(),
        categoryName: ''
      });
      this.isAdding.set(false);
    }, 500);
  }

 
  addAndSort(category:Category){
    this.categories = [...this.categories, category];

    this.categories.sort((a ,b) => {
      const c1 = a.category.toLowerCase();
      const c2 = b.category.toLowerCase();
      if(c1 > c2) return 1;

      if(c1 < c2) return -1;

      return 0;
    })


  }

  removeCategory(id: number): void {

    const removedItem = this.categories.splice(this.categories.findIndex(c  => c.id === id), 1)[0];
    this.categories = this.categories.filter(cat => cat.id !== id);

    if(this.categoryName.value.toLowerCase() === removedItem.category.toLowerCase() && this.errorMessage){


      this.invalidInput = false;
      this.errorMessage = null;
    }
  }

  private get categoryName(){

    return this.categoryForm.get('categoryName') as AbstractControl<string>;
  }

  private onCategoryNameChange(){

    this.categoryName.valueChanges.subscribe(_=> {

      const currentName = this.categoryName.value;
      

      if(currentName.match(this.regex)){
        
        this.invalidInput = true;

        return;
      }

      const duplicates = this.categories.map(c => c.category.toLowerCase()).filter(c => c===currentName.trim().toLowerCase());

      if(duplicates.length){

        this.invalidInput = true;
        this.errorMessage = `${currentName} already added`;

        return;
      }

      this.invalidInput = false;
      this.errorMessage = null;
    })
  }

  submitCategories(): void {
    this.isSubmitting.set(true);
    this.errorMessage = null;
    this.successMessage = null;


    this.adminService.uploadAssessmentCategories(this.categories).subscribe({
      next: (response:HttpResponse<number>) => {
        this.isSubmitting.set(false);
        this.successMessage = 'Uploaded!';
        this.categories = [];
        this.categoryForm.reset({
          id: this.generateId(),
          categoryName: ''
        });
        
        // Clear success message after 5 seconds
        setTimeout(() => this.successMessage = null, 5000);
      },
      error: (err:HttpErrorResponse) => {
        this.isSubmitting.set(false);
        this.errorMessage = err.error.message || 'Failed to upload. Please try again.';
        
        // Clear error message after 5 seconds
        setTimeout(() => this.errorMessage = null, 5000);
      }
    });
  }

  
}
