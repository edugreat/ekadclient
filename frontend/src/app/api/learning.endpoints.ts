

export class LearningEndpoints {
  private readonly baseUrl = 'http://localhost:8080';

  // Tests
   readonly startTest = `${this.baseUrl}/tests/start`;
   readonly submitTest = `${this.baseUrl}/tests/submit`;
   readonly recentPerformance = `${this.baseUrl}/tests/recent_performance`;
  
  // Learning Data
   readonly levels = `${this.baseUrl}/learning/levels`;
   readonly students = `${this.baseUrl}/learning/students`;
   readonly studentTests = `${this.baseUrl}/learning/studentTests`;
   readonly tests = `${this.baseUrl}/learning/tests`;
}