import { Component, effect, inject, OnInit } from '@angular/core';


import { AssessmentStepperComponent } from '../dashboard-items/assessment-stepper/assessment-stepper.component'
import { WidgetsDropdownComponent } from '../dashboard-items/widgets-dropdown/widgets-dropdown.component';
import { RouterOutlet } from '@angular/router';
import { ColComponent, RowComponent } from '@coreui/angular';
import { DashboardStateService } from '../../services/dashboard-state.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';


@Component({
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.scss'],
  imports: [ 
    //ReactiveFormsModule, 
   AssessmentStepperComponent, 
   
   WidgetsDropdownComponent,
    RouterOutlet,
    CommonModule,
   
   // ContainerComponent,
   RowComponent,
   ColComponent
    ],
  standalone:true
})
export class DashboardComponent implements OnInit {



  private dashboardStateService = inject(DashboardStateService);

  hideStepper = toSignal(this.dashboardStateService.hideStepper$);
 

constructor(){

 
}

  // In dashboard.component.ts
ngOnInit(): void {
  
}
}
