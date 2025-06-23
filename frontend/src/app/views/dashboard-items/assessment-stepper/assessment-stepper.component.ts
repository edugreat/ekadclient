import { Component, inject } from '@angular/core';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CardBodyComponent, CardComponent } from '@coreui/angular';
import { IconDirective, IconSetService } from '@coreui/icons-angular';
import { cilCloudUpload, cilCheck } from '@coreui/icons';

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
export class AssessmentStepperComponent {
  fallBackIcons = {cilCloudUpload, cilCheck}

  constructor() {

    //this.iconSet.icons = {cilCloudUpload}
    
   
  }
  
  steps = [
    { label: 'Upload', icon: 'cilCloudUpload', completed: false },
    { label: 'Instructions', icon: 'cilDescription', completed: false },
    { label: 'Notifications', icon: 'cilBell', completed: false },
    { label: 'Done', icon: 'cilCheckCircle', completed: false }
  ];
}