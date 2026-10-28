import type { Request, Response } from "express";
import { ProductMessages } from "./product.messages";
import { ProductService } from "./product.service";
import type {
  CreateFuelProductInput,
  UpdateFuelProductInput,
} from "@flowstation/schemas";

export class ProductController {
  private readonly service = new ProductService();

  getFuelProducts = async (req: Request, res: Response) => {
    const products = await this.service.getFuelProducts(
      req.organisation.organisationId,
    );
    res.status(200).json(products);
  };

  createFuelProduct = async (
    req: Request<Record<string, never>, unknown, CreateFuelProductInput>,
    res: Response,
  ) => {
    const newFuelProduct = await this.service.createFuelProduct(
      req.organisation.organisationId,
      req.body,
    );
    res.status(201).json({
      message: ProductMessages.CREATED,
      newFuelProduct,
    });
  };

  updateFuelProduct = async (
    req: Request<{ id: string }, unknown, UpdateFuelProductInput>,
    res: Response,
  ) => {
    const product = await this.service.updateFuelProduct(
      req.organisation.organisationId,
      req.params.id,
      req.body,
    );
    res.status(200).json(product);
  };

  deleteFuelProduct = async (req: Request<{ id: string }>, res: Response) => {
    await this.service.deleteFuelProduct(
      req.organisation.organisationId,
      req.params.id,
    );
    res.status(200).json({ message: ProductMessages.DELETED });
  };
}
