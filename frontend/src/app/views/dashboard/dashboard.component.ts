import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';


import { AssessmentStepperComponent } from '../dashboard-items/assessment-stepper/assessment-stepper.component'
import { WidgetsDropdownComponent } from '../dashboard-items/widgets-dropdown/widgets-dropdown.component';
import { RouterOutlet } from '@angular/router';
import { ColComponent, ContainerComponent, RowComponent } from '@coreui/angular';


@Component({
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.scss'],
  imports: [ 
    //ReactiveFormsModule, 
   AssessmentStepperComponent, 
   WidgetsDropdownComponent,
    RouterOutlet,
   // ContainerComponent,
   //RowComponent,
   //ColComponent
    ],
  standalone:true
})
export class DashboardComponent implements OnInit {



  ngOnInit(): void {
   
  }
}
