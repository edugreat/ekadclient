import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  
  {
    path: '',
    loadComponent: () => import('./layout').then(m => m.DefaultLayoutComponent),
    data: {
      title: 'Home'
    },
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./admins/dashboard/routes').then((m) => m.routes)
      },
      {
        path: 'theme',
        loadChildren: () => import('./admins/theme/routes').then((m) => m.routes)
      },
      {
        path: 'base',
        loadChildren: () => import('./admins/base/routes').then((m) => m.routes)
      },
      {
        path: 'institution',
        loadChildren: () => import('./admins/institutions/routes').then((m) => m.routes)
      },
      {
        path: 'assessments',
        loadChildren: () => import('./admins/forms/routes').then((m) => m.routes)
      },
     
      {
        path: 'icons',
        loadChildren: () => import('./admins/icons/routes').then((m) => m.routes)
      },
      {
        path: 'notifications',
        loadChildren: () => import('./admins/notifications/routes').then((m) => m.routes)
      },

      {
        path:'students',
        loadChildren:() => import('./admins/performance/routes').then(m => m.routes)

      },

  
      {
        path: 'pages',
        loadChildren: () => import('./admins/pages/routes').then((m) => m.routes)
      }
    ]
  },
  {
    path: '404',
    loadComponent: () => import('./admins/pages/page404/page404.component').then(m => m.Page404Component),
    data: {
      title: 'Page 404'
    }
  },
  {
    path: '500',
    loadComponent: () => import('./admins/pages/page500/page500.component').then(m => m.Page500Component),
    data: {
      title: 'Page 500'
    }
  },
  {
    path: 'login',
    loadComponent: () => import('./admins/pages/login/login.component').then(m => m.LoginComponent),
    data: {
      title: 'Login Page'
    }
  },
  {
    path: 'register',
    loadComponent: () => import('./admins/pages/register/register.component').then(m => m.RegisterComponent),
    data: {
      title: 'Signup Page'
    }
  },
  { path: '**', redirectTo: 'dashboard' }
];
