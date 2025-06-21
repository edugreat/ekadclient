

export class AssignmentEndpoints {
  private readonly baseUrl = 'http://localhost:8080/assignments';

   readonly root = this.baseUrl;
   readonly file = `${this.baseUrl}/file`;
   readonly details = `${this.baseUrl}/details`;
   readonly resource = `${this.baseUrl}/resource`;
}