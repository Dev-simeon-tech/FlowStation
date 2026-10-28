import { FuelProduct } from "./fuelProduct";
import { Customer } from "./customer";
import { Attendant } from "./attendant";

export type PaymentMethod = "CASH" | "CARD" | "TRANSFER";

export type FuelSale = {
  id: string;
  organisationId: string;
  fuelProductId: string;
  attendantId: string;
  customerId?: string | null;
  litresSold: number;
  unitPrice: number;
  totalAmount: number;
  saleDate: string;
  paymentMethod: PaymentMethod;
  fuelProduct?: FuelProduct;
  attendant?: Attendant;
  customer?: Customer | null;
  payment?: Payment | null;
};

export type Payment = {
  id: string;
  organisationId: string;
  fuelSaleId: string;
  amountPaid: number;
  method: PaymentMethod;
  paidAt: string;
  reference?: string | null;
};
