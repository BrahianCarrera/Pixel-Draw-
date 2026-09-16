import { SafeUser } from './user.js';

export interface Artwork {
  id: number;
  name: string | null;
  width: number;
  height: number;
  grid: unknown;
  coupleId: number;
  authorId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ArtworkWithAuthor extends Artwork {
  author: SafeUser;
}

export interface PaginatedArtworks {
  artworks: ArtworkWithAuthor[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
