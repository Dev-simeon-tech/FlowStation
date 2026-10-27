export type Attendant = {
  id: number;
  organisationId: number;
  fullName: string;
  employeeId: string;
  pumpAssigned?: string;
  phone: string;
  isActive: boolean;
  hireDate: string;
};
