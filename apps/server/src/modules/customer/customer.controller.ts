import type { Request, Response } from "express";
import type {
  CreateCustomerInput,
  UpdateCustomerInput,
} from "@flowstation/schemas";
import { CustomerMessages } from "./customer.messages";
import { CustomerService } from "./customer.service";

export class CustomerController {
  private readonly service = new CustomerService();

  getCustomers = async (req: Request, res: Response) => {
    const customers = await this.service.getCustomers(
      req.organisation.organisationId,
    );
    res.status(200).json(customers);
  };

  createCustomer = async (
    req: Request<Record<string, never>, unknown, CreateCustomerInput>,
    res: Response,
  ) => {
    const customer = await this.service.createCustomer(
      req.organisation.organisationId,
      req.body,
    );
    res.status(201).json({
      message: CustomerMessages.CREATED,
      ...customer,
    });
  };

  updateCustomer = async (
    req: Request<{ id: string }, unknown, UpdateCustomerInput>,
    res: Response,
  ) => {
    const customer = await this.service.updateCustomer(
      req.organisation.organisationId,
      req.params.id,
      req.body,
    );
    res.status(200).json(customer);
  };

  getCustomerPurchases = async (
    req: Request<{ id: string }>,
    res: Response,
  ) => {
    const result = await this.service.getCustomerPurchases(
      req.organisation.organisationId,
      req.params.id,
    );
    res.status(200).json(result);
  };
}
