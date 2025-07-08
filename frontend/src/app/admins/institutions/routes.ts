import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Institution Registration Portal'
    },
    children: [
      {
        path: '',
        redirectTo: 'register',
        pathMatch: 'full'
      },
      {
        path: 'register',
        loadComponent: () => import('./register/institution.registration.component').then(m => m.InstitutionRegistrationComponent),
        data: {
          title: 'Institution Registration Portal'
        }
      },

      {
        path: 'add-students/:adminId',
        loadComponent: () => import('./add-students/add-students.component').then(m => m.AddStudentsComponent),
        data: {
          title: 'Add Students'
        }
      },
       {
        path: 'add-students',
        loadComponent: () => import('./add-students/add-students.component').then(m => m.AddStudentsComponent),
        data: {
          title: 'Add Students'
        }
      },
      {
        path: 'students',
        loadComponent: () => import('./dropdowns/dropdowns.component').then(m => m.DropdownsComponent),
        data: {
          title: 'View Students'
        }
      },
    ]
  }
];

