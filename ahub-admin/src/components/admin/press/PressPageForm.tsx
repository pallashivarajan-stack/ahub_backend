import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface PressPageFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

export function PressPageForm({ initialData, onSubmit, isSubmitting }: PressPageFormProps) {
  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");

  useEffect(() => {
    if (initialData) {
      setHeading(initialData.heading || "Press");
      setSubheading(initialData.subheading || "");
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heading) {
      toast.error("Heading is required.");
      return;
    }
    onSubmit({ heading, subheading });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      <div>
        <Label htmlFor="heading">Page Heading *</Label>
        <Input
          id="heading"
          required
          placeholder="Press"
          value={heading}
          onChange={(e) => setHeading(e.target.value)}
          className="rounded-xl border-slate-200"
        />
      </div>
      <div>
        <Label htmlFor="subheading">Page Subheading</Label>
        <Textarea
          id="subheading"
          rows={2}
          placeholder="Latest news, press releases & media coverage from our innovation ecosystem."
          value={subheading}
          onChange={(e) => setSubheading(e.target.value)}
          className="rounded-xl border-slate-200 resize-y"
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting} className="bg-[#FF6B00] hover:bg-[#E05A00] text-white rounded-xl">
          {isSubmitting ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </form>
  );
}
