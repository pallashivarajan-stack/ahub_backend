import { useState, useRef } from "react";
import { Loader2, Image as ImageIcon, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { resolveBackendMediaUrl } from "@/lib/media";
import { useVisionMission, useUpdateVisionMission, useUploadVisionRoadmapImage } from "@/hooks/useCMS";

export function VisionMissionTab() {
  const { data: items, isLoading, isError, error } = useVisionMission();
  const updateItem = useUpdateVisionMission();
  const uploadImage = useUploadVisionRoadmapImage();

  const visionItem = items?.find((i: any) => i.section_type === "vision");
  const missionItem = items?.find((i: any) => i.section_type === "mission");

  if (isLoading) {
    return (
      <div className="py-12 flex justify-center">
        <Loader2 className="animate-spin text-slate-400 h-8 w-8" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-12 text-center text-red-500">
        Failed to load: {error?.message || "Unknown error"}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <VisionMissionCard
        title="Our Vision"
        item={visionItem}
        onSave={(data) => updateItem.mutateAsync({ id: visionItem!.id, itemData: data })}
        uploadImage={uploadImage}
        isPending={updateItem.isPending}
      />
      <VisionMissionCard
        title="Our Mission"
        item={missionItem}
        onSave={(data) => updateItem.mutateAsync({ id: missionItem!.id, itemData: data })}
        uploadImage={uploadImage}
        isPending={updateItem.isPending}
      />
    </div>
  );
}

function VisionMissionCard({
  title,
  item,
  onSave,
  uploadImage,
  isPending,
}: {
  title: string;
  item: any;
  onSave: (data: any) => Promise<any>;
  uploadImage: any;
  isPending: boolean;
}) {
  const [heading, setHeading] = useState(item?.heading || "");
  const [description, setDescription] = useState(item?.description || "");
  const [imageUrl, setImageUrl] = useState(item?.image_url || "");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const prevItemRef = useRef(item);
  if (item !== prevItemRef.current) {
    prevItemRef.current = item;
    if (item) {
      setHeading(item.heading || "");
      setDescription(item.description || "");
      setImageUrl(item.image_url || "");
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const result = await uploadImage.mutateAsync({ entityType: "vision-mission", formData: fd });
      setImageUrl(result.image_url);
      toast.success("Image uploaded!");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSave({ heading, description, image_url: imageUrl || null });
      toast.success("Saved!");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message);
    }
  };

  if (!item) {
    return (
      <Card className="border-slate-100 shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardHeader className="border-b border-slate-50">
          <CardTitle className="text-lg font-extrabold text-slate-900">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-slate-400">No data found.</CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-100 shadow-sm rounded-3xl overflow-hidden bg-white">
      <CardHeader className="border-b border-slate-50">
        <CardTitle className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-[#FF6B00]" />
          {title}
        </CardTitle>
        <CardDescription className="text-slate-400">Edit heading, description, and image.</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
          <div>
            <Label htmlFor={`heading-${title}`}>Heading *</Label>
            <Input
              id={`heading-${title}`}
              required
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              className="rounded-xl border-slate-200"
            />
          </div>
          <div>
            <Label htmlFor={`desc-${title}`}>Description</Label>
            <Textarea
              id={`desc-${title}`}
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-xl border-slate-200 resize-y"
            />
          </div>
          <div>
            <Label>Image</Label>
            <div className="flex items-center gap-4 mt-1">
              {imageUrl ? (
                <div className="relative w-40 h-24 rounded-xl overflow-hidden border border-slate-200">
                  <img src={resolveBackendMediaUrl(imageUrl)} alt={title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-40 h-24 rounded-xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-xs">
                  No image
                </div>
              )}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-xl cursor-pointer"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploading ? (
                    <Loader2 className="animate-spin h-4 w-4 mr-1" />
                  ) : (
                    <Upload className="h-4 w-4 mr-1" />
                  )}
                  {imageUrl ? "Change" : "Upload"}
                </Button>
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-2 border-t border-slate-100">
            <Button type="submit" disabled={isPending} className="bg-[#FF6B00] hover:bg-[#E05A00] text-white rounded-xl">
              {isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
