import { NotFoundException } from "@/execptions";
import prisma from "@/lib/prisma";
import type {
  CreateAttendantInput,
  UpdateAttendantInput,
  UpdateAttendantStatusInput,
} from "@flowstation/schemas";
import { AttendantMessages } from "./attendant.messages";

export class AttendantService {
  async getAttendants(organisationId: string) {
    return prisma.attendant.findMany({ where: { organisationId } });
  }

  async createAttendant(organisationId: string, input: CreateAttendantInput) {
    return prisma.attendant.create({
      data: { ...input, organisationId },
    });
  }

  async updateAttendant(
    organisationId: string,
    id: string,
    input: UpdateAttendantInput,
  ) {
    const existing = await this.findAttendant(organisationId, id);
    return prisma.attendant.update({
      where: { id: existing.id },
      data: input,
    });
  }

  async updateAttendantStatus(
    organisationId: string,
    id: string,
    input: UpdateAttendantStatusInput,
  ) {
    const existing = await this.findAttendant(organisationId, id);
    return prisma.attendant.update({
      where: { id: existing.id },
      data: { isActive: input.isActive },
    });
  }

  private async findAttendant(organisationId: string, id: string) {
    const attendant = await prisma.attendant.findFirst({
      where: { id, organisationId },
      select: { id: true },
    });
    if (!attendant) {
      throw new NotFoundException(AttendantMessages.NOT_FOUND);
    }
    return attendant;
  }
}
