import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Loader2, Upload, ImageIcon, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  useInfrastructureItems,
  useCreateInfrastructureItem,
  useUpdateInfrastructureItem,
  useDeleteInfrastructureItem,
  useUploadInfrastructureImage,
} from "@/hooks/useCMS";
import { resolveBackendMediaUrl } from "@/lib/media";

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero Image",
  gallery: "Gallery Strip",
  side: "Side Images",
  masonry: "Masonry Gallery",
};

const SECTION_ORDER = ["hero", "gallery", "side", "masonry"];

type InfraItem = {
  id: number;
  section: string;
  label: string;
  image_url: string | null;
  display_order: number;
};

function ItemCard({
  item,
  onEdit,
  onDelete,
}: {
  item: InfraItem;
  onEdit: (item: InfraItem) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 transition-shadow hover:shadow-sm">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-slate-50">
        {item.image_url ? (
          <img src={resolveBackendMediaUrl(item.image_url)} alt={item.label} className="h-full w-full object-cover" />
        ) : (
          <ImageIcon className="h-5 w-5 text-slate-300" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-semibold text-slate-900">{item.label}</p>
        <p className="truncate text-[10px] text-slate-400">{item.image_url || "No image"}</p>
      </div>
      <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(item)}>
          <Edit2 className="h-3.5 w-3.5 text-slate-500" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(item.id)}>
          <Trash2 className="h-3.5 w-3.5 text-red-400" />
        </Button>
      </div>
    </div>
  );
}

function ItemFormDialog({
  open,
  onOpenChange,
  editingItem,
  section,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editingItem: InfraItem | null;
  section: string;
}) {
  const createItem = useCreateInfrastructureItem();
  const updateItem = useUpdateInfrastructureItem();
  const uploadImage = useUploadInfrastructureImage();
  const isPending = createItem.isPending || updateItem.isPending;

  const [label, setLabel] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const resetForm = (item: InfraItem | null) => {
    if (item) {
      setLabel(item.label || "");
      setImageUrl(item.image_url || null);
    } else {
      setLabel("");
      setImageUrl(null);
    }
  };

  useEffect(() => { resetForm(editingItem); }, [editingItem]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadImage.mutateAsync(formData);
      setImageUrl(result.image_url);
      toast.success("Image uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      section,
      label,
      image_url: imageUrl,
      display_order: editingItem?.display_order ?? 0,
    };
    try {
      if (editingItem) {
        await updateItem.mutateAsync({ id: editingItem.id, itemData: data });
        toast.success("Item updated!");
      } else {
        await createItem.mutateAsync(data);
        toast.success("Item created!");
      }
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-3xl bg-white">
        <DialogHeader>
          <DialogTitle>{editingItem ? "Edit Item" : `Add Item — ${SECTION_LABELS[section] || section}`}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Image</Label>
            <div className="mt-1 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border bg-slate-50">
                {imageUrl ? (
                  <img src={resolveBackendMediaUrl(imageUrl)} alt="" className="h-12 w-12 object-contain" />
                ) : (
                  <Upload className="h-5 w-5 text-slate-300" />
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
                />
                {isUploading && <Loader2 className="mt-1 h-4 w-4 animate-spin text-slate-400" />}
                {imageUrl && <p className="mt-1 text-[10px] text-slate-400 truncate">URL: {imageUrl}</p>}
              </div>
            </div>
          </div>
          <div>
            <Label>Label *</Label>
            <Input required value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Coworking Space" />
          </div>
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending || isUploading} className="bg-[#FF6B00] hover:bg-[#E05A00] text-white">
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function InfrastructureTab() {
  const { data: items, isLoading } = useInfrastructureItems();
  const deleteItem = useDeleteInfrastructureItem();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InfraItem | null>(null);
  const [activeSection, setActiveSection] = useState("gallery");

  const allItems: InfraItem[] = items ?? [];

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this item?")) return;
    try {
      await deleteItem.mutateAsync(id);
      toast.success("Item deleted");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openAdd = (section: string) => {
    setEditingItem(null);
    setActiveSection(section);
    setDialogOpen(true);
  };

  const openEdit = (item: InfraItem) => {
    setEditingItem(item);
    setActiveSection(item.section);
    setDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-100 shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardHeader className="border-b border-slate-50">
          <div>
            <CardTitle className="text-lg font-extrabold text-slate-900">Infrastructure</CardTitle>
            <CardDescription className="text-slate-400">
              Manage infrastructure images. Each section feeds a different part of the public infrastructure page.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      {SECTION_ORDER.map((section) => {
        const sectionItems = allItems.filter((i) => i.section === section);
        return (
          <Card key={section} className="border-slate-100 shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50">
              <div>
                <CardTitle className="text-base font-extrabold text-slate-900">
                  {SECTION_LABELS[section] || section}
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  {section === "hero" && "Main hero image for the infrastructure page"}
                  {section === "gallery" && "Gallery strip carousel shown on the page"}
                  {section === "side" && "Side images for Collaborative, Research, Events & Facility sections"}
                  {section === "masonry" && "Masonry gallery images displayed in a grid layout"}
                </CardDescription>
              </div>
              <Button
                onClick={() => openAdd(section)}
                className="bg-[#FF6B00] hover:bg-[#E05A00] text-white rounded-xl shrink-0"
                size="sm"
              >
                <Plus className="mr-1 h-4 w-4" /> Add
              </Button>
            </CardHeader>
            <CardContent className="p-4">
              {sectionItems.length === 0 ? (
                <p className="py-4 text-center text-sm text-slate-400">No items in this section.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {sectionItems.map((item) => (
                    <ItemCard key={item.id} item={item} onEdit={openEdit} onDelete={handleDelete} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      <ItemFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingItem={editingItem}
        section={activeSection}
      />
    </div>
  );
}
