export type CustomerType = "WALK_IN" | "REGISTERED";

export type Customer = {
  id: string;
  organisationId: string;
  fullName: string;
  phone?: string | null;
  plateNumber?: string | null;
  customerType: CustomerType;
  createdAt: string;
};
