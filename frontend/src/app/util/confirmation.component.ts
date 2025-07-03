import { Component, inject, OnDestroy } from '@angular/core';
import { ConfirmationService } from '../services/confirmation.service';
import {
  ButtonDirective,
  ModalBodyComponent,
  ModalComponent,
  ModalFooterComponent,
  ModalHeaderComponent
} from '@coreui/angular';
import { Subscription } from 'rxjs';

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
export class ConfirmationComponent implements OnDestroy {
  message?: string;
  visible = false;
  private subscription:Subscription;
  private confirmationService = inject(ConfirmationService);

  constructor() {
   this.subscription = this.confirmationService.actionMessageConfirm$.subscribe((message) => {
      this.message = message;
       this.visible = !!message;
    });
  }

  confirm(response: boolean) {
    this.confirmationService.confirmationResponse(response);
    this.visible = false;
    this.message = undefined;
  }

  ngOnDestroy(): void {
    
    this.subscription.unsubscribe();
  }
}