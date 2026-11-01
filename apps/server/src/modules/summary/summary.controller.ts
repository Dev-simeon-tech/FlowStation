import { SummaryService } from "./summary.service";
import type { Request, Response } from "express";

export class SummaryController {
  private readonly service = new SummaryService();

  dailySummary = async (
    req: Request<object, unknown, unknown, { date: string }>,
    res: Response,
  ) => {
    const result = await this.service.getDailySummary(
      req.organisation.organisationId,
      req.query.date,
    );
    res.json(result);
  };

  summaryHistory = async (req: Request, res: Response) => {
    const result = await this.service.getSummaryHistory(
      req.organisation.organisationId,
    );
    res.json(result);
  };
}
