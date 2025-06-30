// widgets-dropdown.component.ts
import { AfterContentInit, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { getStyle } from '@coreui/utils';
import { ChartjsComponent } from '@coreui/angular-chartjs';
import { RouterLink } from '@angular/router';
import { IconDirective } from '@coreui/icons-angular';
//import {cilBook, cilTask, cilNoteAdd} from '@coreui/icons'
import {
  ButtonDirective,
  
  RowComponent,

  ColComponent,
  DropdownComponent,
  DropdownDividerDirective,
  DropdownItemDirective,
  DropdownMenuDirective,
  DropdownToggleDirective,
  TemplateIdDirective,
  WidgetStatAComponent
} from '@coreui/angular';

@Component({
  selector: 'app-widgets-dropdown',
  templateUrl: './widgets-dropdown.component.html',
  styleUrls: ['./widgets-dropdown.component.scss'],
  imports: [ColComponent, WidgetStatAComponent, TemplateIdDirective, IconDirective, 
            DropdownComponent, ButtonDirective, DropdownToggleDirective, 
            DropdownMenuDirective, DropdownItemDirective, RouterLink, 
            DropdownDividerDirective, ChartjsComponent,  ColComponent, RowComponent]
})
export class WidgetsDropdownComponent implements OnInit, AfterContentInit {
  private changeDetectorRef = inject(ChangeDetectorRef);
 

  data: any[] = [];
  options: any[] = [];


  constructor(){

   
  }
  
  // Labels that represent tasks to perform(task that require notifying the student once completed)
  labels = ['upload content','post instructions','send notifications','you are done'];
  
  // Updated dataset to represent assignment completion trends
  datasets = [
    {
      label: 'Assignment Completion',
      backgroundColor: 'transparent',
      borderColor: 'rgba(255,255,255,.55)',
      pointBackgroundColor: getStyle('--cui-primary'),
      pointHoverBorderColor: getStyle('--cui-primary'),
      data: [45, 60, 75, 82, 68, 90, 85] // Completion percentages
    }
  ];

  optionsDefault = {
    plugins: { legend: { display: false } },
    maintainAspectRatio: false,
    scales: {
      x: {
        border: { display: false },
        grid: { display: false, drawBorder: false },
        ticks: { display: false }
      },
      y: {
        min: 0,  // Changed to 0-100 scale for percentages
        max: 100,
        display: false,
        grid: { display: false },
        ticks: { display: false }
      }
    },
    elements: {
      line: { borderWidth: 1, tension: 0.4 },
      point: { radius: 4, hitRadius: 10, hoverRadius: 4 }
    }
  };

  ngOnInit(): void {
    this.setData();
  }

  ngAfterContentInit(): void {
    this.changeDetectorRef.detectChanges();
  }

  setData() {
    this.data[0] = {
      labels: this.labels,
      datasets: this.datasets
    };
    this.setOptions();
  }

  setOptions() {
    this.options.push(JSON.parse(JSON.stringify(this.optionsDefault)));
  }
}