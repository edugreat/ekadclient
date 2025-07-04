import { Component, effect, inject, OnInit, ViewChild} from '@angular/core';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CardBodyComponent, CardComponent } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { cilCloudUpload, cilCheck } from '@coreui/icons';
import { AdminService } from '../../../services/admin.service';
import{toSignal} from '@angular/core/rxjs-interop'

@Component({
  selector: 'app-assessment-stepper',
  standalone: true,
  imports: [
    MatStepperModule,
    MatButtonModule,
    MatIconModule,
    CardComponent,
    CardBodyComponent,
    IconDirective,
   
   
  ],
  templateUrl: './assessment-stepper.component.html',
  styleUrls: ['./assessment-stepper.component.scss']
})
export class AssessmentStepperComponent implements OnInit {
  fallBackIcons = {cilCloudUpload, cilCheck};

  @ViewChild('taskCompletionStepper')taskCompletionStepper?:MatStepper;

  private adminService = inject(AdminService);


  private taskCompletion = toSignal(this.adminService.taskMilestoneObs$);

  constructor() {

    effect(() => {
      const milestone = this.taskCompletion();

      if(milestone !== undefined && milestone > 0){

        this.handleMilestone(milestone);
      }
    })
    
    }


  ngOnInit(): void {
    
   
  }
  
  steps = [
    { label: 'Upload', icon: 'cilCloudUpload', completed: false },
    { label: 'Guides', icon: 'cilDescription', completed: false },
    { label: 'Notify', icon: 'cilBell', completed: false },
    { label: 'Done', icon: 'cilCheckCircle', completed: false }
  ];

  private handleMilestone(milestone:number){

    if(!this.taskCompletionStepper) return;

 


    const stepIndex = milestone - 1;

    if(stepIndex >= 0 && stepIndex < this.steps.length){

      const step = this.taskCompletionStepper.steps.get(stepIndex);

      if(step){

        step.completed = true;
      }
    }

    if(milestone < this.steps.length){

      this.taskCompletionStepper.selectedIndex = milestone;
    }

    if(milestone+1 >= this.steps.length){

      setTimeout(() => {
        this.resetStepper()
      }, 2000);
    }

  }

  resetStepper(){

    if(!this.taskCompletionStepper) return;

    this.taskCompletionStepper.steps.forEach(step => {

      step.completed = false;
    })

    this.taskCompletionStepper.selectedIndex = 0;
  }
}