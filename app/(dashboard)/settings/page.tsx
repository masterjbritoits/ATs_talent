import { SettingsPanel } from "@/components/settings/settings-panel";
import { prisma } from "@/lib/db/prisma";

export default async function SettingsPage() {
  const settings = await prisma.systemSetting.findMany({ orderBy: { key: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-2 text-sm text-muted">
          Configure mailbox sync, OCR, scoring thresholds, AI adapters, storage, and export defaults.
        </p>
      </div>
      <SettingsPanel settings={settings} />
    </div>
  );
}
