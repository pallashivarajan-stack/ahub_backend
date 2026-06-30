import { useState } from "react";
import { Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUploadMentorImage } from "@/hooks/useCMS";
import { resolveBackendMediaUrl } from "@/lib/media";
import { toast } from "sonner";

interface MentorFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function MentorForm({ initialData, onSubmit, onCancel, isSubmitting }: MentorFormProps) {
  const uploadImageMutation = useUploadMentorImage();
  const [name, setName] = useState(initialData?.name || "");
  const [title, setTitle] = useState(initialData?.title || "");
  const [organization, setOrganization] = useState(initialData?.organization || "");
  const [linkedIn, setLinkedIn] = useState(initialData?.linked_in || initialData?.linkedIn || "");
  const [displayOrder, setDisplayOrder] = useState(initialData?.display_order || 0);
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || initialData?.image || "");
  const [isUploading, setIsUploading] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    try {
      const res = await uploadImageMutation.mutateAsync(formData);
      setImageUrl(res.image_url);
      toast.success("Image uploaded successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !title) {
      toast.error("Please fill in name and title.");
      return;
    }
    onSubmit({
      name,
      title,
      organization: organization || null,
      linked_in: linkedIn || null,
      display_order: displayOrder,
      image_url: imageUrl || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            required
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-xl border-slate-200"
          />
        </div>
        <div>
          <Label htmlFor="title">Title / Role *</Label>
          <Input
            id="title"
            required
            placeholder="Strategy & Operations Expert"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-xl border-slate-200"
          />
        </div>
        <div>
          <Label htmlFor="organization">Organization</Label>
          <Input
            id="organization"
            placeholder="Incubation Council"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            className="rounded-xl border-slate-200"
          />
        </div>
        <div>
          <Label htmlFor="linkedIn">LinkedIn URL</Label>
          <Input
            id="linkedIn"
            type="url"
            placeholder="https://linkedin.com/in/username"
            value={linkedIn}
            onChange={(e) => setLinkedIn(e.target.value)}
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
        <div className="md:col-span-2">
          <Label>Profile Picture</Label>
          <div className="mt-2 flex flex-col sm:flex-row items-center gap-4 p-4 border border-dashed rounded-2xl bg-slate-50/50">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-white border overflow-hidden shadow-sm shrink-0">
              {imageUrl ? (
                <img
                  src={resolveBackendMediaUrl(imageUrl)}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImageIcon className="h-8 w-8 text-slate-300" />
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-xs">
                  <Loader2 className="animate-spin text-white h-6 w-6" />
                </div>
              )}
            </div>
            <div className="space-y-2 text-center sm:text-left w-full">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isUploading}
                className="hidden"
                id="mentor-file-upload"
              />
              <Label
                htmlFor="mentor-file-upload"
                className="inline-flex h-10 items-center justify-center px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 bg-white shadow-xs hover:bg-slate-50 cursor-pointer transition-colors"
              >
                Choose Image File
              </Label>
              <p className="text-xs text-slate-400">
                Supports JPG, PNG or WebP files. Max 5MB.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || isUploading} className="bg-[#FF6B00] hover:bg-[#E05A00] text-white rounded-xl">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            "Save Mentor"
          )}
        </Button>
      </div>
    </form>
  );
}
