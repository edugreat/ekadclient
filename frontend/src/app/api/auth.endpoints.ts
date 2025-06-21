// auth-endpoints.ts
export class AuthEndpoints {
    private readonly baseUrl = 'http://localhost:8080';
  
    readonly signIn = `${this.baseUrl}/auth/sign-in`;
    readonly refreshToken = `${this.baseUrl}/auth/refresh-token`;
    readonly cachedUser = `${this.baseUrl}/auth/cached/user`;
    readonly disconnect = `${this.baseUrl}/auth/disconnect`;
    readonly logout = `${this.baseUrl}/auth/logout`;
  }