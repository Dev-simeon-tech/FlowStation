import type { Request, Response } from "express";
import type { UpdateOrganisationProfileInput } from "@flowstation/schemas";
import { ProfileService } from "./profile.service";

export class ProfileController {
  private readonly service = new ProfileService();

  updateOrganisationProfile = async (
    req: Request<Record<string, never>, unknown, UpdateOrganisationProfileInput>,
    res: Response,
  ) => {
    const profile = await this.service.updateOrganisationProfile(
      req.organisation.organisationId,
      req.body,
    );
    res.status(200).json({
      message: "Organisation profile updated successfully",
      profile,
    });
  };
}
