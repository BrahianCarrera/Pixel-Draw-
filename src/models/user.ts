export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  coupleId?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export type SafeUser = Omit<User, 'password'>;
