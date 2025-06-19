import { Component } from '@angular/core';
import { IconDirective } from '@coreui/icons-angular';
import { cilLockLocked, cilPhone, cilUser } from '@coreui/icons';
import { IconSetService } from '@coreui/icons-angular';
import { 
  ContainerComponent, 
  RowComponent, 
  ColComponent, 
  TextColorDirective, 
  CardComponent, 
  CardBodyComponent, 
  FormDirective, 
  InputGroupComponent, 
  InputGroupTextDirective, 
  FormControlDirective, 
  ButtonDirective
} from '@coreui/angular';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
    imports: [
      CommonModule,
      ContainerComponent, 
      RowComponent, 
      ColComponent, 
      TextColorDirective, 
      CardComponent, 
      CardBodyComponent, 
      FormDirective, 
      InputGroupComponent, 
      InputGroupTextDirective, 
      IconDirective, 
      FormControlDirective, 
      ButtonDirective,
      MatIconModule,
     
    ],
    standalone: true,
    providers: [IconSetService]
})
export class RegisterComponent {
  showPassword: boolean = false;
  showInstructorOption: boolean = false;

  constructor(public iconSet: IconSetService) {
    iconSet.icons = { cilLockLocked, cilPhone, cilUser };
  }

  togglePasswordVisibility(input: HTMLInputElement) {
    this.showPassword = !this.showPassword;
    input.type = this.showPassword ? 'text' : 'password';
  }

  toggleInstructorOption() {
    this.showInstructorOption = !this.showInstructorOption;
  }
}