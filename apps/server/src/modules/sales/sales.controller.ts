import type { Request, Response } from "express";
import type { CreateSaleInput } from "@flowstation/schemas";
import { SalesService } from "./sales.service";

export class SalesController {
  private readonly service = new SalesService();

  getSales = async (req: Request, res: Response) => {
    const sales = await this.service.getSales(req.organisation.organisationId);
    res.status(200).json(sales);
  };

  getSale = async (req: Request<{ id: string }>, res: Response) => {
    const sale = await this.service.getSale(
      req.organisation.organisationId,
      req.params.id,
    );
    res.status(200).json(sale);
  };

  createSale = async (
    req: Request<Record<string, never>, unknown, CreateSaleInput>,
    res: Response,
  ) => {
    const sale = await this.service.createSale(
      req.organisation.organisationId,
      req.body,
    );
    res.status(201).json(sale);
  };
}
