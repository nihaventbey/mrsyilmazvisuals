"use client";

import { useState } from "react";
import { ActionForm } from "@/components/admin/ActionForm";
import { saveAdSenseSettings } from "@/app/admin/actions";
import { InputField } from "@/components/ui/Field";
import {
  ADSENSE_SLOT_META,
  type AdSenseSettings,
  type AdSenseSlotId,
} from "@/lib/adsense-defaults";

export function AdSenseSettingsForm({
  initial,
}: {
  initial: AdSenseSettings;
}) {
  const [settings, setSettings] = useState(initial);

  const slotIds = Object.keys(ADSENSE_SLOT_META) as AdSenseSlotId[];

  return (
    <ActionForm action={saveAdSenseSettings} submitLabel="Reklam Ayarlarını Kaydet">
      <label className="flex items-start gap-3 rounded-xl border border-espresso/10 bg-cream/60 p-4">
        <input
          type="checkbox"
          name="enabled"
          value="true"
          checked={settings.enabled}
          onChange={(e) =>
            setSettings((prev) => ({ ...prev, enabled: e.target.checked }))
          }
          className="mt-1 h-4 w-4 rounded border-espresso/20 text-gold focus:ring-gold"
        />
        <span>
          <span className="block text-sm font-medium text-espresso">
            Google AdSense&apos;i sitede etkinleştir
          </span>
          <span className="mt-1 block text-xs text-mocha">
            Kapalıyken script ve tüm reklam alanları gizlenir.{" "}
            <code className="rounded bg-white/70 px-1">/ads.txt</code> yalnızca
            açıkken yayınlanır.
          </span>
        </span>
      </label>

      <InputField
        label="Publisher ID"
        name="publisher_id"
        value={settings.publisherId}
        onChange={(e) =>
          setSettings((prev) => ({ ...prev, publisherId: e.target.value }))
        }
        placeholder="ca-pub-xxxxxxxxxxxxxxxx"
        required={settings.enabled}
      />

      <label className="flex items-start gap-3 rounded-xl border border-espresso/10 bg-cream/60 p-4">
        <input
          type="checkbox"
          name="test_mode"
          value="true"
          checked={settings.testMode}
          onChange={(e) =>
            setSettings((prev) => ({ ...prev, testMode: e.target.checked }))
          }
          className="mt-1 h-4 w-4 rounded border-espresso/20 text-gold focus:ring-gold"
        />
        <span>
          <span className="block text-sm font-medium text-espresso">
            Test modu (data-adtest=on)
          </span>
          <span className="mt-1 block text-xs text-mocha">
            Yerel ve önizleme için açık tutun. Canlı yayında kapayın.
          </span>
        </span>
      </label>

      <div className="space-y-4">
        <p className="text-sm font-medium text-espresso">Reklam alanları</p>
        <p className="text-xs text-mocha">
          Her alan için AdSense konsolunda bir reklam birimi oluşturup Slot ID
          yapıştırın.
        </p>
        {slotIds.map((id) => {
          const meta = ADSENSE_SLOT_META[id];
          const slot = settings.slots[id];
          return (
            <div
              key={id}
              className="rounded-2xl border border-espresso/10 bg-white/50 p-5"
            >
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name={`slot_${id}_enabled`}
                  value="true"
                  checked={slot.enabled}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      slots: {
                        ...prev.slots,
                        [id]: { ...prev.slots[id], enabled: e.target.checked },
                      },
                    }))
                  }
                  className="mt-1 h-4 w-4 rounded border-espresso/20 text-gold focus:ring-gold"
                />
                <span>
                  <span className="block text-sm font-medium text-espresso">
                    {meta.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-mist">{meta.hint}</span>
                </span>
              </label>
              <div className="mt-3">
                <InputField
                  label="Slot ID"
                  name={`slot_${id}_id`}
                  value={slot.slotId}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      slots: {
                        ...prev.slots,
                        [id]: { ...prev.slots[id], slotId: e.target.value },
                      },
                    }))
                  }
                  placeholder="1234567890"
                />
              </div>
            </div>
          );
        })}
      </div>
    </ActionForm>
  );
}
