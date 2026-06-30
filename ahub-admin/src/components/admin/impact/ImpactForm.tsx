import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ImpactFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function ImpactForm({ initialData, onSubmit, onCancel, isSubmitting }: ImpactFormProps) {
  const [metricId, setMetricId] = useState(initialData?.metric_id || "");
  const [value, setValue] = useState(initialData?.value || "");
  const [label, setLabel] = useState(initialData?.label || "");
  const [subLabel, setSubLabel] = useState(initialData?.sub_label || "");
  const [displayOrder, setDisplayOrder] = useState(initialData?.display_order ?? 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!metricId || !value || !label) {
      toast.error("Please fill in metric_id, value, and label.");
      return;
    }
    onSubmit({
      metric_id: metricId,
      value,
      label,
      sub_label: subLabel || null,
      display_order: displayOrder,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="metricId">Metric ID *</Label>
          <Input
            id="metricId"
            required
            placeholder="active-startups"
            value={metricId}
            onChange={(e) => setMetricId(e.target.value)}
            className="rounded-xl border-slate-200"
          />
        </div>
        <div>
          <Label htmlFor="value">Value *</Label>
          <Input
            id="value"
            required
            placeholder="237"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="rounded-xl border-slate-200"
          />
        </div>
        <div>
          <Label htmlFor="label">Label *</Label>
          <Input
            id="label"
            required
            placeholder="ACTIVE STARTUPS"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="rounded-xl border-slate-200"
          />
        </div>
        <div>
          <Label htmlFor="subLabel">Sub Label</Label>
          <Input
            id="subLabel"
            placeholder="(BUILT UP)"
            value={subLabel}
            onChange={(e) => setSubLabel(e.target.value)}
            className="rounded-xl border-slate-200"
          />
        </div>
        <div>
          <Label htmlFor="order">Display Order</Label>
          <Input
            id="order"
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
            className="rounded-xl border-slate-200"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="bg-[#FF6B00] hover:bg-[#E05A00] text-white rounded-xl">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            "Save Metric"
          )}
        </Button>
      </div>
    </form>
  );
}
