import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentUploadComponent } from './assessment-upload.component';

describe('AssessmentUploadComponent', () => {
  let component: AssessmentUploadComponent;
  let fixture: ComponentFixture<AssessmentUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessmentUploadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssessmentUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
