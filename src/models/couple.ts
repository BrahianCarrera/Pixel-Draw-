import { SafeUser } from './user.js';

export interface Couple {
  id: number;
  inviteCode: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CoupleWithMembers extends Couple {
  members: SafeUser[];
  _count?: {
    artworks: number;
  };
}
