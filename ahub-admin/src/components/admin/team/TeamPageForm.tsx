import { useState } from "react";
import { Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUploadTeamPageImage } from "@/hooks/useCMS";
import { resolveBackendMediaUrl } from "@/lib/media";
import { toast } from "sonner";

interface TeamPageFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

export function TeamPageForm({ initialData, onSubmit, isSubmitting }: TeamPageFormProps) {
  const uploadImageMutation = useUploadTeamPageImage();
  const [groupPhoto, setGroupPhoto] = useState(initialData?.group_photo || initialData?.groupPhoto || "");
  const [title, setTitle] = useState(initialData?.title || "");
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [memberCountLabel, setMemberCountLabel] = useState(initialData?.member_count_label || initialData?.memberCountLabel || "");
  const [isUploading, setIsUploading] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    try {
      const res = await uploadImageMutation.mutateAsync(formData);
      setGroupPhoto(res.image_url);
      toast.success("Group photo uploaded successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      group_photo: groupPhoto || null,
      title,
      subtitle: subtitle || null,
      description: description || null,
      member_count_label: memberCountLabel || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="teamPageTitle">Title</Label>
          <Input
            id="teamPageTitle"
            placeholder="The A-Hub Family"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-xl border-slate-200"
          />
        </div>
        <div>
          <Label htmlFor="teamPageSubtitle">Subtitle</Label>
          <Input
            id="teamPageSubtitle"
            placeholder="14 Members · One Mission"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="rounded-xl border-slate-200"
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="teamPageDesc">Description</Label>
          <Textarea
            id="teamPageDesc"
            rows={2}
            placeholder="Building Andhra Pradesh's premier startup incubation ecosystem"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="rounded-xl border-slate-200 resize-y"
          />
        </div>
        <div>
          <Label htmlFor="memberCountLabel">Member Count Label</Label>
          <Input
            id="memberCountLabel"
            placeholder="Team Members"
            value={memberCountLabel}
            onChange={(e) => setMemberCountLabel(e.target.value)}
            className="rounded-xl border-slate-200"
          />
        </div>
      </div>
      <div>
        <Label>Group Photo</Label>
        <div className="mt-2 flex flex-col sm:flex-row items-center gap-4 p-4 border border-dashed rounded-2xl bg-slate-50/50">
          <div className="relative flex h-32 w-48 items-center justify-center rounded-2xl bg-white border overflow-hidden shadow-sm shrink-0">
            {groupPhoto ? (
              <img
                src={resolveBackendMediaUrl(groupPhoto)}
                alt="Group Preview"
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
              id="team-page-file-upload"
            />
            <Label
              htmlFor="team-page-file-upload"
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
      <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
        <Button type="submit" disabled={isSubmitting || isUploading} className="bg-[#FF6B00] hover:bg-[#E05A00] text-white rounded-xl">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            "Save Team Page Settings"
          )}
        </Button>
      </div>
    </form>
  );
}
