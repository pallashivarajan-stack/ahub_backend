import { useState } from "react";
import { Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUploadPartnerImage } from "@/hooks/useCMS";
import { resolveBackendMediaUrl } from "@/lib/media";
import { toast } from "sonner";

interface PartnerFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function PartnerForm({ initialData, onSubmit, onCancel, isSubmitting }: PartnerFormProps) {
  const uploadImageMutation = useUploadPartnerImage();
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [websiteUrl, setWebsiteUrl] = useState(initialData?.website_url || initialData?.websiteUrl || "");
  const [showInTicker, setShowInTicker] = useState(initialData?.show_in_ticker ?? true);
  const [displayOrder, setDisplayOrder] = useState(initialData?.display_order || 0);
  const [logoUrl, setLogoUrl] = useState(initialData?.logo_url || initialData?.logo || "");
  const [isUploading, setIsUploading] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    try {
      const res = await uploadImageMutation.mutateAsync(formData);
      setLogoUrl(res.image_url);
      toast.success("Logo uploaded successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to upload logo.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description) {
      toast.error("Please fill in name and description.");
      return;
    }
    onSubmit({
      name,
      description,
      website_url: websiteUrl || null,
      show_in_ticker: showInTicker,
      display_order: displayOrder,
      logo_url: logoUrl || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="name">Partner Name *</Label>
          <Input
            id="name"
            required
            placeholder="TiE Vizag"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            required
            placeholder="Brief description of the partner..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="rounded-xl border-slate-200 min-h-[80px]"
          />
        </div>
        <div>
          <Label htmlFor="website">Website URL</Label>
          <Input
            id="website"
            type="url"
            placeholder="https://example.com"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            className="rounded-xl border-slate-200"
          />
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showInTicker}
              onChange={(e) => setShowInTicker(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-[#FF6B00] focus:ring-[#FF6B00]"
            />
            <span className="text-sm font-medium text-slate-700">Show in Homepage Ticker</span>
          </label>
        </div>
        <div className="md:col-span-2">
          <Label>Partner Logo</Label>
          <div className="mt-2 flex flex-col sm:flex-row items-center gap-4 p-4 border border-dashed rounded-2xl bg-slate-50/50">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-white border overflow-hidden shadow-sm shrink-0">
              {logoUrl ? (
                <img
                  src={resolveBackendMediaUrl(logoUrl)}
                  alt="Preview"
                  className="h-full w-full object-contain p-2"
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
                id="partner-file-upload"
              />
              <Label
                htmlFor="partner-file-upload"
                className="inline-flex h-10 items-center justify-center px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 bg-white shadow-xs hover:bg-slate-50 cursor-pointer transition-colors"
              >
                Choose Logo File
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
            "Save Partner"
          )}
        </Button>
      </div>
    </form>
  );
}
