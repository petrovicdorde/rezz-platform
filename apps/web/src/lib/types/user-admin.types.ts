import type { UserRole } from '@rezz/shared';

export interface AdminUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  isBlacklisted: boolean;
  blacklistedAt: string | null;
  blacklistReason: string | null;
  venueId: string | null;
  googleId: string | null;
  createdAt: string;
  updatedAt: string;
}
