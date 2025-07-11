import { Routes } from "@angular/router";

import { PerformanceComponent } from '../../admins/performance/performance.component';
import { AnalyticsComponent } from './analytics/analytic.component';
export const routes:Routes = [

    {
        path:'',
        component:PerformanceComponent,
        data:{
            title:'students performance'
        },
        children:[

            {
                path: ':studentId',
                component: AnalyticsComponent
            }
        ]
    }
]