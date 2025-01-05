export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  role: 'USER' | 'ADMIN';
}

export const users: User[] = [];
