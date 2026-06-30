import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface PressFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const PRESS_TAGS = [
  "Event", "Funding", "Grants", "Recognition", "Partnership",
  "Infrastructure", "Leadership", "Global", "Innovation", "Space Tech",
  "Community", "Education", "MedTech", "Pharma", "Milestone",
  "Policy", "Strategy",
];

export function PressForm({ initialData, onSubmit, onCancel, isSubmitting }: PressFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [date, setDate] = useState(initialData?.date || "");
  const [url, setUrl] = useState(initialData?.url || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [source, setSource] = useState(initialData?.source || "");
  const [tag, setTag] = useState(initialData?.tag || "");
  const [displayOrder, setDisplayOrder] = useState(initialData?.display_order || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !url || !description || !source || !tag) {
      toast.error("Please fill in all required fields.");
      return;
    }
    onSubmit({
      title,
      date,
      url,
      description,
      source,
      tag,
      display_order: displayOrder,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            required
            placeholder="A-Hub entrepreneurs raise ₹68 cr funds in 1 yr"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-xl border-slate-200"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              required
              placeholder="Apr 05, 2024"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border-slate-200"
            />
          </div>
          <div>
            <Label htmlFor="source">Source *</Label>
            <Input
              id="source"
              required
              placeholder="Times of India"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="rounded-xl border-slate-200"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="url">URL (Redirection Link) *</Label>
          <Input
            id="url"
            type="url"
            required
            placeholder="https://timesofindia.indiatimes.com/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="rounded-xl border-slate-200"
          />
        </div>
        <div>
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            required
            rows={3}
            placeholder="Brief description of the press coverage..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="rounded-xl border-slate-200 resize-y"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="tag">Tag / Category *</Label>
            <Select value={tag} onValueChange={setTag} required>
              <SelectTrigger className="rounded-xl border-slate-200">
                <SelectValue placeholder="Select a tag" />
              </SelectTrigger>
              <SelectContent>
                {PRESS_TAGS.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="bg-[#FF6B00] hover:bg-[#E05A00] text-white rounded-xl">
          {isSubmitting ? "Saving..." : "Save Press Item"}
        </Button>
      </div>
    </form>
  );
}
