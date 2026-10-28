import type { Request, Response } from "express";
import type { CreateStockEntryInput } from "@flowstation/schemas";
import { StockService } from "./stock.service";

export class StockController {
  private readonly service = new StockService();

  getStockEntries = async (req: Request, res: Response) => {
    const entries = await this.service.getStockEntries(
      req.organisation.organisationId,
    );
    res.status(200).json(entries);
  };

  getStockEntry = async (req: Request<{ id: string }>, res: Response) => {
    const entry = await this.service.getStockEntry(
      req.organisation.organisationId,
      req.params.id,
    );
    res.status(200).json(entry);
  };

  createStockEntry = async (
    req: Request<Record<string, never>, unknown, CreateStockEntryInput>,
    res: Response,
  ) => {
    const entry = await this.service.createStockEntry(
      req.organisation.organisationId,
      req.body,
    );
    res.status(201).json(entry);
  };

  getStockBalance = async (req: Request, res: Response) => {
    const balance = await this.service.getStockBalance(
      req.organisation.organisationId,
    );
    res.status(200).json(balance);
  };
}
