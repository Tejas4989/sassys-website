"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { saveHours, createHolidayOverride, deleteHolidayOverride } from "@/lib/actions/hours";
import { formatTime } from "@/lib/data/hours";

const DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

interface HourRow { id: number; dayOfWeek: number; opensAt: string; closesAt: string; isClosed: boolean; }
interface Override { id: string; date: string; label: string; isClosed: boolean; opensAt?: string | null; closesAt?: string | null; }

const DEFAULT_HOURS: HourRow[] = DAY_NAMES.map((_, i) => ({
  id: i,
  dayOfWeek: i,
  opensAt: i === 0 || i === 6 ? "07:00" : "05:30",
  closesAt: i === 5 || i === 6 ? "23:00" : i === 4 ? "21:00" : "20:00",
  isClosed: false,
}));

interface Props {
  initialHours: HourRow[];
  initialOverrides: Override[];
}

export function HoursEditor({ initialHours, initialOverrides }: Props) {
  const merged = DAY_NAMES.map((_, i) =>
    initialHours.find((h) => h.dayOfWeek === i) ?? DEFAULT_HOURS[i]
  );

  const [hoursState, setHoursState] = useState(merged);
  const [overrides, setOverrides] = useState(initialOverrides);
  const [saving, setSaving] = useState(false);
  const [showAddOverride, setShowAddOverride] = useState(false);

  function setField(idx: number, field: keyof HourRow, value: any) {
    setHoursState((prev) =>
      prev.map((h, i) => (i === idx ? { ...h, [field]: value } : h))
    );
  }

  async function handleSave() {
    setSaving(true);
    try {
      await saveHours(hoursState.map(({ dayOfWeek, opensAt, closesAt, isClosed }) => ({
        dayOfWeek, opensAt, closesAt, isClosed,
      })));
      toast.success("Hours saved!");
    } catch {
      toast.error("Failed to save hours.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddOverride(fd: FormData) {
    await createHolidayOverride(fd);
    setShowAddOverride(false);
    toast.success("Holiday override added.");
    // Reload handled by server revalidation
  }

  async function handleDeleteOverride(id: string) {
    await deleteHolidayOverride(id);
    setOverrides((prev) => prev.filter((o) => o.id !== id));
    toast.success("Override removed.");
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Regular Hours</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {hoursState.map((h, i) => (
            <div key={h.dayOfWeek} className="flex items-center gap-4 flex-wrap">
              <span className="w-28 text-sm font-medium shrink-0">{DAY_NAMES[h.dayOfWeek]}</span>
              <div className="flex items-center gap-2">
                <Switch
                  id={`closed-${i}`}
                  checked={h.isClosed}
                  onCheckedChange={(v) => setField(i, "isClosed", v)}
                />
                <Label htmlFor={`closed-${i}`} className="text-sm text-muted-foreground">
                  Closed
                </Label>
              </div>
              {!h.isClosed && (
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={h.opensAt}
                    onChange={(e) => setField(i, "opensAt", e.target.value)}
                    className="w-32 text-sm"
                  />
                  <span className="text-muted-foreground text-sm">–</span>
                  <Input
                    type="time"
                    value={h.closesAt}
                    onChange={(e) => setField(i, "closesAt", e.target.value)}
                    className="w-32 text-sm"
                  />
                </div>
              )}
            </div>
          ))}
          <Button className="mt-4" size="sm" onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
            Save Hours
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            Holiday Overrides
            <Button variant="outline" size="sm" onClick={() => setShowAddOverride(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Date
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {overrides.length === 0 && !showAddOverride && (
            <p className="text-sm text-muted-foreground">No upcoming holiday overrides.</p>
          )}
          <div className="space-y-2">
            {overrides.map((ov) => (
              <div key={ov.id} className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0">
                <div>
                  <span className="font-medium">{ov.label}</span>
                  <span className="text-muted-foreground ml-2">({ov.date})</span>
                  <span className="text-muted-foreground ml-2">
                    {ov.isClosed ? "Closed" : `${formatTime(ov.opensAt ?? "")} – ${formatTime(ov.closesAt ?? "")}`}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDeleteOverride(ov.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>

          {showAddOverride && (
            <form action={handleAddOverride} className="mt-4 p-4 border border-border rounded-xl space-y-3 bg-muted/30">
              <h4 className="text-sm font-semibold">Add Holiday Override</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="label">Label</Label>
                  <Input id="label" name="label" placeholder="Christmas Day" required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" name="date" type="date" required />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="ov-closed" name="isClosed" defaultChecked />
                <Label htmlFor="ov-closed">Closed all day</Label>
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm">Add</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddOverride(false)}>Cancel</Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
