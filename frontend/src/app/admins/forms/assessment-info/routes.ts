import { Routes } from "@angular/router";
import { AssessmentInfoComponent } from "./assessment-info.component";

export const routes:Routes = [

    {

        path: '',
        component: AssessmentInfoComponent,
        data:{

            title: 'Assessment information'
        },
        children:[

           {
            path:':testId/:topic',
            loadComponent:() => import('./assessment-questions.component').then(m => m.AssessmentQuestionsComponent),
            data:{

                title:'Assessment Questions'
            }
           }
        ]
    }
]