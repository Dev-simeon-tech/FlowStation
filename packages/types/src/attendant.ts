export type Attendant = {
  id: string;
  organisationId: string;
  fullName: string;
  employeeId: string;
  pumpAssigned?: string | null;
  phone: string;
  isActive: boolean;
  hireDate: string;
};
