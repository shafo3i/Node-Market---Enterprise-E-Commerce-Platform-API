import { prisma } from "../../config/prisma";
import type { UpdateDebugModeInput } from "./security.validation";

interface DebugModeSettings {
  enabled: boolean;
}

export const SecurityService = {
  async getDebugMode(): Promise<DebugModeSettings> {
    try {
      const settings = await prisma.settings.findUnique({
        where: { key: 'debug_mode' },
      });
      return (settings?.value as unknown as DebugModeSettings) || { enabled: false };
    } catch (error) {
      console.error('Error fetching debug mode settings:', error);
      return { enabled: false };
    }
  },

  async updateDebugMode(data: UpdateDebugModeInput, performedBy: string): Promise<DebugModeSettings> {
    const currentSettings = await this.getDebugMode();
    const newSettings = { enabled: data.enabled };

    await prisma.settings.upsert({
      where: { key: 'debug_mode' },
      create: { key: 'debug_mode', value: newSettings as any },
      update: { value: newSettings as any },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'USER',
        entityId: 'debug_mode',
        performedBy,
        actorType: 'ADMIN',
        before: currentSettings as any,
        after: newSettings as any,
      },
    });

    return newSettings;
  },
};
