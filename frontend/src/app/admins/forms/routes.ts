import { Routes } from '@angular/router';
import { AssessmentViewComponent } from './assessments/assessment-view.component';

export const routes: Routes = [
  {
    path: '',
    component: AssessmentViewComponent,
    data: {
      title: 'Assessments'
    },
    children: [
      // {
      //   path: '',
      //   redirectTo: 'view',
      //   pathMatch: 'full'
      // },

        {
       path: 'topics',
       loadComponent:() => import('./assessment-topics/assessment-topics.component').then(m => m.AssessmentTopicsComponent),

       data:{
        title: 'Assessments Topics'
       }
      },

        {
       path: 'topics/:categoryId',
       loadComponent:() => import('./assessment-topics/assessment-topics.component').then(m => m.AssessmentTopicsComponent),

       data:{
        title: 'Assessments Topics'
       }
      },

      {
        path: ':categoryId',
       
       loadChildren:() => import('./assessment-info/routes').then(m => m.routes)
     
      },

     

     
      // {
      //   path: 'view',
      //   loadComponent: () => import('./assessments/assessment-view.component').then(m => m.AssessmentViewComponent),
      //   data: {
      //     title: 'View Assessments'
      //   }
      // },
    
      {
        path: 'range',
        loadComponent: () => import('./ranges/ranges.component').then(m => m.RangesComponent),
        data: {
          title: 'Range'
        }
      },
      {
        path: 'input-group',
        loadComponent: () => import('./input-groups/input-groups.component').then(m => m.InputGroupsComponent),
        data: {
          title: 'Input Group'
        }
      },
      {
        path: 'floating-labels',
        loadComponent: () => import('./floating-labels/floating-labels.component').then(m => m.FloatingLabelsComponent),
        data: {
          title: 'Floating Labels'
        }
      },
      {
        path: 'layout',
        loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
        data: {
          title: 'Layout'
        }
      },
      {
        path: 'validation',
        loadComponent: () => import('./validation/validation.component').then(m => m.ValidationComponent),
        data: {
          title: 'Validation'
        }
      },

      // {
      //   path:'**',
      //   redirectTo:'page'
        
      // }
    ]
  },


];
