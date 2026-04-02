export interface Employee {
  id: string;
  type: 'ACTIVE' | 'INVITED';
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: 'MANAGER' | 'WORKER';
  isActive: boolean;
  invitationStatus?: 'PENDING' | 'EXPIRED';
  createdAt: string;
}

export interface InviteEmployeeRequest {
  email: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  role: 'MANAGER' | 'WORKER';
}
