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
        path: '',
        redirectTo: 'admin',
        pathMatch: 'full'
      },
     
      {
        path: 'assessment',
        loadComponent: () => import('../test-upload/test-upload.component').then(m => m.UploadTestComponent),
        data: {
          title: 'assessment upload'
        }
      }
    ]
  }
];