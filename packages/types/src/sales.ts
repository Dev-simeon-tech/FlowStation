import { FuelProduct } from "./fuelProduct";
import { Customer } from "./customer";
import { Attendant } from "./attendant";

export type FuelSale = {
  id: string;
  organisationId: string;
  fuelProductId: string;
  attendantId: string;
  customerId?: string;
  litresSold: number;
  unitPrice: number;
  totalAmount: number;
  saleDate: string;
  paymentMethod: "CASH" | "CARD" | "TRANSFER";
  fuelProduct?: FuelProduct;
  attendant?: Attendant;
  customer?: Customer;
  payment?: Payment;
};

export type Payment = {
  id: string;
  organisationId: string;
  fuelSaleId: string;
  amountPaid: number;
  method: "CASH" | "CARD" | "TRANSFER";
  paidAt: string;
  reference?: string;
};
