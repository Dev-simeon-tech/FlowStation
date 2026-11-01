export type FuelType = "PETROL" | "DIESEL" | "KEROSENE";

export type FuelProduct = {
  id: string;
  organisationId: string;
  name: string;
  type: FuelType;
  pricePerLitre: number;
  unit: string;
  createdAt: string;
};
