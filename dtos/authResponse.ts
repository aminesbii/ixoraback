export interface AuthResponse {
  token: string;
  userId: string;
  name: string;
  email: string;
  isAdmin: boolean;
  isTutor: boolean;
}
