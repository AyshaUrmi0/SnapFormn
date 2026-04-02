export interface UpdateProfileInput {
  name?: string;
  avatarUrl?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
  createdAt: Date;
}
