export type FuelProduct = {
  id: string;
  organisationId: string;
  name: string;
  type: "PETROL" | "DIESEL" | "KEROSENE";
  pricePerLitre: number;
  unit: string;
  createdAt: string;
};
