import { api } from '@/lib/api';
import type { Employee, InviteEmployeeRequest } from '@/lib/types/employee.types';

export const employeesApi = {
  getAll: async (venueId: string): Promise<Employee[]> => {
    const response = await api.get<Employee[]>(
      `/venues/${venueId}/employees`,
    );
    return response.data;
  },

  invite: async (
    venueId: string,
    data: InviteEmployeeRequest,
  ): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(
      `/venues/${venueId}/employees/invite`,
      data,
    );
    return response.data;
  },

  updateRole: async (
    venueId: string,
    employeeId: string,
    role: 'MANAGER' | 'WORKER',
  ): Promise<{ message: string }> => {
    const response = await api.patch<{ message: string }>(
      `/venues/${venueId}/employees/${employeeId}/role`,
      { role },
    );
    return response.data;
  },

  remove: async (
    venueId: string,
    employeeId: string,
  ): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(
      `/venues/${venueId}/employees/${employeeId}`,
    );
    return response.data;
  },

  cancelInvitation: async (
    venueId: string,
    invitationId: string,
  ): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(
      `/venues/${venueId}/employees/invitations/${invitationId}`,
    );
    return response.data;
  },
};
