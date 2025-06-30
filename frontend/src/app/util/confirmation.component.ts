import { Component, inject } from '@angular/core';
import { ConfirmationService } from '../services/confirmation.service';
import {
  ButtonDirective,
  ModalBodyComponent,
  ModalComponent,
  ModalFooterComponent,
  ModalHeaderComponent
} from '@coreui/angular';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss'],
  standalone: true,
  imports: [
    ModalComponent,
    ModalHeaderComponent,
    ModalBodyComponent,
    ModalFooterComponent,
    ButtonDirective
  ]
})
export class ConfirmationComponent {
  message?: string;
  visible = false;
  private confirmationService = inject(ConfirmationService);

  constructor() {
    this.confirmationService.actionMessageConfirm$.subscribe((message) => {
      this.message = message;
      if (message) {
        this.visible = true;
      }
    });
  }

  confirm(response: boolean) {
    this.confirmationService.confirmationResponse(response);
    this.visible = false;
  }
}