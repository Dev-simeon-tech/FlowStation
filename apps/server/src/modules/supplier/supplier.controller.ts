import type { Request, Response } from "express";
import type { CreateSupplierInput } from "@flowstation/schemas";
import { SupplierMessages } from "./supplier.messages";
import { SupplierService } from "./supplier.service";

export class SupplierController {
  private readonly service = new SupplierService();

  getSuppliers = async (req: Request, res: Response) => {
    const suppliers = await this.service.getSuppliers(
      req.organisation.organisationId,
    );
    res.status(200).json(suppliers);
  };

  createSupplier = async (
    req: Request<Record<string, never>, unknown, CreateSupplierInput>,
    res: Response,
  ) => {
    const supplier = await this.service.createSupplier(
      req.organisation.organisationId,
      req.body,
    );
    res.status(201).json({
      message: SupplierMessages.CREATED,
      ...supplier,
    });
  };

  deleteSupplier = async (req: Request<{ id: string }>, res: Response) => {
    await this.service.deleteSupplier(
      req.organisation.organisationId,
      req.params.id,
    );
    res.status(200).json({ message: SupplierMessages.DELETED });
  };
}
