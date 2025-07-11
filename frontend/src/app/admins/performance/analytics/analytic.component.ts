import { Component, inject, OnInit, signal } from '@angular/core';
import { ChartData } from 'chart.js';
import { ChartjsComponent } from '@coreui/angular-chartjs';
import { RowComponent, ColComponent, CardComponent, CardHeaderComponent, CardBodyComponent, BadgeComponent, SpinnerComponent } from '@coreui/angular';

import { ActivatedRoute, RouterLink } from '@angular/router';
import { take } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AdminService, StudentPerformance } from '../../../services/admin.service';
import { IconComponent } from '@coreui/icons-angular';
import { CommonModule } from '@angular/common';
import { UtilService } from 'src/app/util/util.service';

type ChartType = 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'polarArea';


type Chart = {

  type:string,
  name:string
}

type ChartObject = {
  [key in ChartType]?: ChartData;
}

@Component({
  selector: 'app-analytic',
  templateUrl: './analytic.component.html',
  styleUrls: ['./analytic.component.scss'],
  imports: [
    RowComponent, 
    ColComponent, 
    CardComponent, 
    CardHeaderComponent, 
    CardBodyComponent, 
   
    BadgeComponent,
    IconComponent,
    CommonModule,
    RouterLink,
    SpinnerComponent,
    ChartjsComponent
  ],
  standalone: true
})
export class AnalyticsComponent implements OnInit {
  private adminService = inject(AdminService);
  private activatedRoute = inject(ActivatedRoute);

  private utilService = inject(UtilService);

 

  isLoading = signal(false);
  errorMessage = '';
  showAllCharts = false;
  chartReady =  signal(false);
 
  
  studentPerformances: StudentPerformance[] = [];
  assessmentNames: string[] = [];
  averageAssessmentScore = 0;

  chartObjects:ChartObject[] = [];
  private bufferedChartObjs:ChartObject[] = [];

  private assessmentScores:number[] = [];
  chartTypes:Chart[] = []

  options = {

    maintainAspectRatio:false
  }

  

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      const studentId = +params['studentId'];
      if (studentId) {
        this.loadStudentPerformance(studentId);
      }

      
    });
  }



  constructor(){
   
   this.chartTypes = [

    {type:'pie',
      name:'Pie Chart'
    },
    {type:'bar',
      name:'Bar Chart'
    },

    {type:'line',
      name:'Line Chart'
    },
    {type:'doughnut',
      name:'Doughnut Chart'
    },
    {type:'radar',
      name:'Radar Chart'
    },
    {
      type:'polarArea',
      name:'polar Area Chart'
    }
   ].sort((a,b) => a.type.localeCompare(b.type));
    
  }

  clearPreviousData(){

    this.averageAssessmentScore = 0;
    this.chartReady.set(false);
    this.chartObjects = [];
     this.errorMessage = '';
   
  }

  loadStudentPerformance(studentId: number): void {
    this.isLoading.set(true);
   this.clearPreviousData();
    
    this.adminService.fetchStudentPerformanceInfo(studentId).pipe(take(1)).subscribe({
      next: (performances: StudentPerformance[]) => {
        this.studentPerformances = performances;
        if (performances.length) {
         
          this.assessmentScores = [...performances.map(p => p.score)];
          
         // console.log(`performance: ${JSON.stringify(this.studentPerformances, null, 1)}`)
          const performanceIds = performances.map(p => p.id);
          this.getAssessmentNames(performanceIds);
        } else {
          this.isLoading.set(false);
          console.log('no performance')
        }
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = err.message || 'Failed to load performance data';
        this.isLoading.set(false);
      }
    });
  }

  private getAssessmentNames(performanceIds: number[]): void {
    this.adminService.fetchAssessmentNames(performanceIds).pipe(take(1)).subscribe({
      next: (names: string[]) => {
        this.assessmentNames = names;

       
        this.computeAverageAssessmentScore();
        this.prepareCharts(this.assessmentNames, this.assessmentScores);

        this.isLoading.set(false);
        
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = err.message || 'Failed to load assessment names';
        this.assessmentNames = []
        this.isLoading.set(false);
      }
    });
  }

  private prepareCharts(assessments:string[], scores:number[]){

    
   

   const chartBarData:ChartData = {
    labels:[...assessments],
    datasets:[
      {
        label:'performance',
        backgroundColor: '#f87979',
        data:[...scores]
      }
    ]

    };

    const barChartObj:ChartObject = {
      bar:chartBarData
    };

    this.chartObjects.push(barChartObj);

    const chartLineData:ChartData = {
      labels:[...assessments],
      datasets:[{
        label:'performance',
        backgroundColor: 'rgba(220, 220, 220, 0.2)',
        borderColor: 'rgba(220, 220, 220, 1)',
        pointBackgroundColor: 'rgba(220, 220, 220, 1)',
        pointBorderColor: '#fff',
        data:[...scores]
      }]
    };

    const lineChartObj:ChartObject = {
      line:chartLineData
    };

    this.chartObjects.push(lineChartObj);

   const chartDoughnutData:ChartData = {

      labels:[...assessments],
      datasets:[
        {
          label:'performance',
        backgroundColor: ['#41B883', '#E46651', '#00D8FF', '#DD1B16'],
        data:[...scores]
      }
    ]
    };

    const doughnutChartOb:ChartObject = {
      doughnut:chartDoughnutData
    };

    this.chartObjects.push(doughnutChartOb);

    const chartPieData:ChartData = {
      labels:[...assessments],
      datasets:[
        {
          label:'assessment',
          data:[...scores],
           backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
           hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']

        }
      ]
    };

    const pieChartObj:ChartObject = {
      pie:chartPieData
    };

    this.chartObjects.push(pieChartObj);

    const chartPolarAreaData:ChartData ={
      labels:[...assessments],
      datasets:[{
        label:'performance',
        data:[...scores],
         backgroundColor: ['#FF6384', '#4BC0C0', '#FFCE56', '#E7E9ED', '#36A2EB']
      }]
    };

    const polarAreaChartObj:ChartObject = {
      polarArea:chartPolarAreaData
    };

    this.chartObjects.push(polarAreaChartObj)

    const chartRadarData:ChartData = {
      labels:[...assessments],
      datasets:[{
        label:'performance',
        data:[...scores],
         backgroundColor: 'rgba(179,181,198,0.2)',
        borderColor: 'rgba(179,181,198,1)',
        pointBackgroundColor: 'rgba(179,181,198,1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(179,181,198,1)'
      }]
    };

    const radarChartObj:ChartObject = {
      radar:chartRadarData
    };

    this.chartObjects.push(radarChartObj);

    this.bufferedChartObjs = [...this.chartObjects]

    this.chartReady.set(true);
    this.utilService.scrollChartIntoView(true);

  }

  // returns chart type (bar, pie etc, for use in template)
  getChartType(obj:ChartObject):ChartType{

    return Object.keys(obj)[0] as ChartType;
  }

 

  private generateChartColors(count: number): string[] {
    const colors: string[] = [];
    for (let i = 0; i < count; i++) {
      colors.push(`hsl(${(i * 360 / count)}, 70%, 50%)`);
    }
    return colors;
  }

  private computeAverageAssessmentScore(): void {
    if (this.studentPerformances.length === 0) {
      this.averageAssessmentScore = 0;
      return;
    }
    
    const total = this.studentPerformances.reduce((sum, p) => sum + (p.score * 10), 0);
    this.averageAssessmentScore = total / this.studentPerformances.length;
  }

  changeChartType(event: Event): void {

    const target = event.target as HTMLSelectElement;

   if(target.value === 'all charts'){

    this.chartObjects = [...this.bufferedChartObjs];

    this.utilService.scrollChartIntoView(true)

    return;
   }else{

     this.chartObjects = this.bufferedChartObjs.filter(c => c[target.value as ChartType]);

     this.utilService.scrollChartIntoView(true)
   }
    
  }

  toggleAllCharts(): void {
    this.showAllCharts = !this.showAllCharts;
  }

  

  getPerformanceBadgeColor(): string {
    if (this.averageAssessmentScore >= 80) return 'success';
    if (this.averageAssessmentScore >= 60) return 'info';
    if (this.averageAssessmentScore >= 40) return 'warning';
    return 'danger';
  }

  getPerformanceRank(): string {
    if (this.averageAssessmentScore >= 80) return 'Excellent';
    if (this.averageAssessmentScore >= 60) return 'Good';
    if (this.averageAssessmentScore >= 40) return 'Average';
    return 'Needs Improvement';
  }

  shareChart(type?: ChartType): void {
    // In a real app, implement actual sharing functionality
    // This could use a service to convert chart to image and share
   //alert(`Sharing ${type || this.currentChartType} chart`);
  }

  toPrecision(value: number): number {
    if (!value) return 0;
    return Math.round(value * 10) / 10;
  }
}