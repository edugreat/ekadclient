import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService, AssessmentTopic } from '../../../services/admin.service';
import { distinctUntilChanged, startWith, Subscription, take } from 'rxjs';
import { FormsModule } from '@angular/forms';

import { 
  CardComponent,
  CardBodyComponent,
  CardHeaderComponent,
  ColComponent,
  ContainerComponent,
  FormControlDirective,
  RowComponent,
  ButtonDirective,
  SpinnerComponent,
  AlertComponent} from '@coreui/angular';


import { CommonModule } from '@angular/common';
import { ConfirmationService } from '../../../services/confirmation.service';
import { ConfirmationComponent } from '../../../util/confirmation.component';

@Component({
    selector: 'app-assessment-topics',
    templateUrl: './assessment-topics.component.html',
    styleUrls: ['./assessment-topics.component.scss'],
    imports: [
     
         ContainerComponent,
      RowComponent,
      ColComponent,
      CardComponent,
      CardHeaderComponent,
      CardBodyComponent,
     
     
      ButtonDirective,
      FormControlDirective,
      CommonModule,
      FormsModule,
      SpinnerComponent,
      AlertComponent,
      ConfirmationComponent,
      
    CommonModule,
     
     FormsModule, 
    
    ]
})
export class AssessmentTopicsComponent implements OnInit {
    private activatedRoute = inject(ActivatedRoute);
    private adminService = inject(AdminService);
    private confirmService = inject(ConfirmationService)
    private router = inject(Router);
    private subscription?: Subscription;
    private categoryId = signal<number|undefined>(undefined);

    assessmentTopics?: AssessmentTopic[];
    errorMessage: string | null = null;
    browserBusy = signal<'nil'|'busy'>('nil');

    // Editing state
    editingMode = false;
    editableIndex: number | undefined = undefined;
    newValue = '';

    constructor() {
        effect(() => {
            if (this.categoryId() !== undefined) {
                console.log(`fetching topics ${this.categoryId()}`)
               
                setTimeout(() => {

                    this.getAssessmentTopics(this.categoryId()!);
                    
                }, 600); //critical code that corrects the clients greedy routing to server before all required state are fully initialized 

            }
        });
    }

    ngOnInit(): void {
        this.subscription = this.activatedRoute.params.pipe(
            distinctUntilChanged(),
          //  startWith('')
        ).subscribe(params => {
            const id = params['categoryId'];
            if (!isNaN(id)) {
                this.categoryId.set(Number(id));
            }
        });
    }

    ngOnDestroy(): void {
        this.subscription?.unsubscribe();
    }

    private getAssessmentTopics(categoryId: number) {
        this.browserBusy.set('busy');
        //this.errorMessage = null;

        this.adminService.getAssessmentTopics(categoryId).pipe(
            take(1)
        ).subscribe({
            next: (data: AssessmentTopic[]) => {
                this.assessmentTopics = data;
                
              
            },
            error: (err) => {
                this.errorMessage = err.message || 'Failed to load assessment topics';
                this.browserBusy.set('nil');
            },
            complete: () => {
                this.browserBusy.set('nil');
            }
        });
    }

    editTopic(index: number, value: string) {
        this.editingMode = true;
        this.editableIndex = index;
        this.newValue = value;
    }

    cancelEditing() {
        this.editingMode = false;
        this.editableIndex = undefined;
        this.newValue = '';
    }

    goToViewPage(topic:string){

        this.router.navigate(['/assessments', this.categoryId(), this.categoryId(), topic])
    }

    saveChanges() {
        if (this.editableIndex === undefined || !this.assessmentTopics || !this.categoryId()) {
           
            this.cancelEditing();
            return;
        }

        this.confirmService.confirmAction('Save Changes ?').subscribe(approve => {

          
            if(approve){

      const topicToUpdate = this.assessmentTopics![this.editableIndex!];
        const oldValue = topicToUpdate.topic;
        
        if (oldValue === this.newValue.trim()) {
            this.cancelEditing();
            this.errorMessage = 'No changes made'
            return;
        }

        this.browserBusy.set('busy');
        this.adminService.updateAssessementTopic(
          {assessmentId: topicToUpdate.assessmentId, categoryId: this.categoryId()!, currentName:this.newValue.trim()}
           
        ).subscribe({
            next: () => {
                this.getAssessmentTopics(this.categoryId()!);
                this.editableIndex = undefined;
                this.editingMode = false;
                this.newValue = '';
            },
            error: (err) => {
                this.errorMessage = err.message || 'Failed to update topic';
                this.browserBusy.set('nil');
            }
        });


            }
        })

        
    }

    deleteTopic(assessmentId:number, topic:string) {
        if (!this.assessmentTopics || !this.categoryId()||this.assessmentTopics.length === 0) {
            return;
        }

        this.confirmService.confirmAction(`Delete ${topic} ?`).subscribe(approve => {

            if(approve && this.assessmentTopics){


        this.browserBusy.set('busy');
         // Find the topic to delete (since we're working with an array now)
        const topicToDelete = this.assessmentTopics.find(t => t.topic === topic);
        if (!topicToDelete) {
            this.errorMessage = 'nothing to delete';
            this.browserBusy.set('nil');

            return;
        }

        this.browserBusy.set('busy');
        this.adminService.deleteAssessmentTopic(
            assessmentId,
           this.categoryId()!
        ).subscribe({
            next: () => {
                this.getAssessmentTopics(this.categoryId()!);
            },
            error: (err) => {
                this.errorMessage = err.message || 'Failed to delete topic';
                this.browserBusy.set('nil');
            }
        });
            }
        })

    }

    clear() {
        this.router.navigate(['..'], { relativeTo: this.activatedRoute });
    }
}
