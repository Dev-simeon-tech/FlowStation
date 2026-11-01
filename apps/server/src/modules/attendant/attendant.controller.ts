import type { Request, Response } from "express";
import type {
  CreateAttendantInput,
  UpdateAttendantInput,
  UpdateAttendantStatusInput,
} from "@flowstation/schemas";
import { AttendantMessages } from "./attendant.messages";
import { AttendantService } from "./attendant.service";

export class AttendantController {
  private readonly service = new AttendantService();

  getAttendants = async (req: Request, res: Response) => {
    const attendants = await this.service.getAttendants(
      req.organisation.organisationId,
    );
    res.status(200).json(attendants);
  };

  createAttendant = async (
    req: Request<Record<string, never>, unknown, CreateAttendantInput>,
    res: Response,
  ) => {
    const attendant = await this.service.createAttendant(
      req.organisation.organisationId,
      req.body,
    );
    res.status(201).json({
      message: AttendantMessages.CREATED,
      ...attendant,
    });
  };

  updateAttendant = async (
    req: Request<{ id: string }, unknown, UpdateAttendantInput>,
    res: Response,
  ) => {
    const attendant = await this.service.updateAttendant(
      req.organisation.organisationId,
      req.params.id,
      req.body,
    );
    res.status(200).json(attendant);
  };

  updateAttendantStatus = async (
    req: Request<{ id: string }, unknown, UpdateAttendantStatusInput>,
    res: Response,
  ) => {
    const attendant = await this.service.updateAttendantStatus(
      req.organisation.organisationId,
      req.params.id,
      req.body,
    );
    res.status(200).json(attendant);
  };
}
