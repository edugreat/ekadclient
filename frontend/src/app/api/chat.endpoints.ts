

export class ChatEndpoints {
  private readonly baseUrl = 'http://localhost:8080/chats';

  // Group Management
   readonly createGroup = `${this.baseUrl}/group?new=true`;
   readonly groupInfo = `${this.baseUrl}/group_info`;
   readonly allGroups = `${this.baseUrl}/groups`;
   readonly myGroupIds = `${this.baseUrl}/ids`;
   readonly editGroup = `${this.baseUrl}/editGroup`;
   readonly deleteGroup = `${this.baseUrl}/deleteGroup`;
   readonly leaveGroup = `${this.baseUrl}/exit`;
   readonly groupJoinDate = `${this.baseUrl}/grp_joined_at`;
  
  // Messages
   readonly messages = `${this.baseUrl}/messages`;
   readonly newMessage = `${this.baseUrl}/new_chat`;
   readonly editMessage = `${this.baseUrl}/modify/msg`;
   readonly deleteMessage = `${this.baseUrl}/del_msg`;
   readonly recentPosts = `${this.baseUrl}/recent/post`;
  
  // Requests
   readonly joinRequest = `${this.baseUrl}/join_req`;
   readonly approveRequest = `${this.baseUrl}/approve`;
   readonly declineRequest = `${this.baseUrl}/decline`;
   readonly pendingRequests = `${this.baseUrl}/pending`;
  
  // Notifications
   readonly deleteNotifications = `${this.baseUrl}/delete`;
}