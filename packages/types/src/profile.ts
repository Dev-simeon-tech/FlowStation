import type { Organisation } from "./auth";

export type OrganisationProfile = Pick<
  Organisation,
  "id" | "name" | "address"
>;

export type UpdateOrganisationProfileResponse = {
  message: string;
  profile: OrganisationProfile;
};
