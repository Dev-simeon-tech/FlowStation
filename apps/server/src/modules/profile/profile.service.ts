import prisma from "@/lib/prisma";
import type { UpdateOrganisationProfileInput } from "@flowstation/schemas";
import type { OrganisationProfile } from "@flowstation/types";

export class ProfileService {
  async updateOrganisationProfile(
    organisationId: string,
    input: UpdateOrganisationProfileInput,
  ): Promise<OrganisationProfile> {
    return prisma.organisation.update({
      where: { id: organisationId },
      data: {
        name: input.name,
        address: input.address?.trim() || null,
      },
      select: {
        id: true,
        name: true,
        address: true,
      },
    });
  }
}
