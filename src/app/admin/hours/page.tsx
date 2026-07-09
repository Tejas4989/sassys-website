"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Note: This page uses client-side forms with server actions.
// The server actions are defined in a separate actions file.
// Placeholder UI — wired to real server actions in Phase 2.

const DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

export default function AdminHoursPage() {
  return (
    <div>
      <h1 className="font-heading text-3xl font-bold mb-1">Hours</h1>
      <p className="text-muted-foreground text-sm mb-8">
        Update regular hours and add holiday closures.
      </p>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Regular Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {DAY_NAMES.map((day, i) => (
              <div key={day} className="flex items-center gap-4">
                <span className="w-28 text-sm font-medium">{day}</span>
                <Switch id={`closed-${i}`} />
                <Label htmlFor={`closed-${i}`} className="text-sm text-muted-foreground mr-4">
                  Closed
                </Label>
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    type="time"
                    defaultValue="05:30"
                    className="w-32 text-sm"
                  />
                  <span className="text-muted-foreground">–</span>
                  <Input
                    type="time"
                    defaultValue="20:00"
                    className="w-32 text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
          <Button className="mt-6" size="sm">Save Hours</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            Holiday Overrides
            <Button variant="outline" size="sm">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Date
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No holiday overrides added yet. Click &quot;Add Date&quot; to add a holiday closure.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
