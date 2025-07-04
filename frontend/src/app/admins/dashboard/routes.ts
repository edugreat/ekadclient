import { Routes } from '@angular/router';
import '@angular/localize';
import { DashboardComponent } from './dashboard.component';

export const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,  
    data: {
      title: $localize`Dashboard`
    },
    children: [
      
     
      {
        path: 'assessment',
        loadComponent: () => import('../test-upload/test-upload.component').then(m => m.UploadTestComponent),
        data: {
          title: 'assessment upload'
        }
      },
      {
        path:'subjects',
        loadComponent:() => import ('../subject/subject-upload.component').then(m => m.SubjectUploadComponent),
        data:{
          title:'add subjects'
        }
      },

      {
        path: 'categories',
        loadComponent:() => import('../assessment-category/assessment-category.component').then(m => m.AssessmentCategoryComponent),

        data:{
          title:'specify assessment categories'
        }
      }
    ]
  }
];