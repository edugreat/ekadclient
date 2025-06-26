

export class AdminEndpoints {
  private readonly baseUrl = 'http://localhost:8080';

  // Test Management
   readonly test = `${this.baseUrl}/admins/test`;
   readonly notify = `${this.baseUrl}/admins/notify`;
   readonly delete = `${this.baseUrl}/admins/delete`;
  
  // Assessment Management
   readonly assessment = `${this.baseUrl}/admins/assessment`;
   readonly modifyTest = `${this.baseUrl}/admins/modify/test`;
  
  // Question Management
   readonly updateQuestion = `${this.baseUrl}/admins/update/questions`;
   readonly deleteQuestion = `${this.baseUrl}/admins/del/question`;
  
  // Topic Management
   readonly topics = `${this.baseUrl}/admins/topics`;
   readonly editTopic = `${this.baseUrl}/admins/edit/topic`;
   readonly deleteTopic = `${this.baseUrl}/admins/del/topic`;
  
  // Subject Management
   readonly subjects = `${this.baseUrl}/admins/subjects`;
   readonly updateSubjectName = `${this.baseUrl}/admins/update/subject_name`;
   readonly deleteSubject = `${this.baseUrl}/admins/delete/subject`;
  
  // Category Management
   readonly updateCategory = `${this.baseUrl}/admins/update/category`;
   readonly deleteCategory = `${this.baseUrl}/admins/delete/category`;
  
  // User Management
   readonly register = `${this.baseUrl}/admins/register`;
   readonly registerStudent = `${this.baseUrl}/admins/register_student`;
   readonly institutions = `${this.baseUrl}/admins/institutions`;
   readonly disable = `${this.baseUrl}/admins/disable`
   readonly enable = `${this.baseUrl}/admins/enable`
}