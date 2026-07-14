"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import { ImageUpload } from "./image-upload";

// Client-only: keeps tiptap/ProseMirror out of the server (Worker) bundle.
const RichTextEditor = dynamic(
  () => import("./rich-text-editor").then((m) => m.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div className="border border-border rounded-lg min-h-[160px] p-3 text-sm text-muted-foreground">
        Loading editor…
      </div>
    ),
  }
);

interface Special {
  id: string;
  title: string;
  body: string;
  imageKey?: string | null;
  startsOn: Date;
  endsOn: Date;
  isActive: boolean;
}

interface Props {
  special?: Special;
  action: (fd: FormData) => Promise<void>;
  deleteAction?: () => Promise<void>;
}

export function SpecialForm({ special, action, deleteAction }: Props) {
  const [imageKey, setImageKey] = useState(special?.imageKey ?? "");
  const [isActive, setIsActive] = useState(special?.isActive ?? true);
  const [body, setBody] = useState(
    special?.body ?? "<p>Describe this week's special...</p>"
  );

  async function handleSubmit(fd: FormData) {
    fd.set("imageKey", imageKey);
    fd.set("isActive", isActive ? "on" : "off");
    fd.set("body", body);
    await action(fd);
  }

  function toDateInput(d: Date) {
    return d.toISOString().split("T")[0];
  }

  const today = new Date().toISOString().split("T")[0];
  const nextWeek = new Date(Date.now() + 7 * 86400_000).toISOString().split("T")[0];

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="title">Title *</Label>
        <Input id="title" name="title" required defaultValue={special?.title} placeholder="Weekend BBQ Special" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="startsOn">Start Date *</Label>
          <Input
            id="startsOn"
            name="startsOn"
            type="date"
            required
            defaultValue={special ? toDateInput(special.startsOn) : today}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="endsOn">End Date *</Label>
          <Input
            id="endsOn"
            name="endsOn"
            type="date"
            required
            defaultValue={special ? toDateInput(special.endsOn) : nextWeek}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Description *</Label>
        <RichTextEditor
          initialContent={special?.body ?? "<p>Describe this week's special...</p>"}
          onChange={setBody}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Photo (optional)</Label>
        <ImageUpload folder="specials" currentKey={imageKey} onUpload={setImageKey} />
      </div>

      <div className="flex items-center gap-3">
        <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
        <Label htmlFor="isActive" className="cursor-pointer">
          {isActive ? "Active (shown on homepage)" : "Hidden"}
        </Label>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit">Save</Button>
        <Button asChild variant="outline"><Link href="/admin/specials">Cancel</Link></Button>
        {deleteAction && (
          <Button
            type="button"
            variant="destructive"
            className="ml-auto"
            onClick={async () => {
              if (confirm("Archive this special?")) await deleteAction();
            }}
          >
            Archive
          </Button>
        )}
      </div>
    </form>
  );
}
