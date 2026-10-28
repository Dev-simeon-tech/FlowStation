export type SupplierFuelType = {
  id: string;
  supplierId: string;
  fuelProductId: string;
};

export type Supplier = {
  id: string;
  organisationId: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  createdAt: string;
  fuelTypes?: SupplierFuelType[];
};
