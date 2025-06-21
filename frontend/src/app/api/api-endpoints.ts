import { Injectable } from "@angular/core";
import { AdminEndpoints } from "./admin.endpoints";
import { AssignmentEndpoints } from "./assignment.endpoints";
import { AuthEndpoints } from "./auth.endpoints";
import { ChatEndpoints } from "./chat.endpoints";
import { LearningEndpoints } from "./learning.endpoints";


@Injectable({ providedIn: 'root' })
export class ApiEndpoints {
  readonly auth = new AuthEndpoints();
  readonly admin = new AdminEndpoints();
  readonly learning = new LearningEndpoints();
  readonly chat = new ChatEndpoints();
  readonly assignment = new AssignmentEndpoints();
}