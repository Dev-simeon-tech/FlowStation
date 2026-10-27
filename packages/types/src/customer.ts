export type Customer = {
  id: string;
  organisationId: string;
  fullName: string;
  phone?: string;
  plateNumber?: string;
  customerType: "WALK_IN" | "REGISTERED";
};
